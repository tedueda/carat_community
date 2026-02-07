import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { ArrowLeft, Send, Users, Lock, Unlock, UserCircle } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

interface SalonRoom {
  id: number;
  creator_id: number;
  theme: string;
  description: string;
  target_identities: string[];
  room_type: string;
  allow_anonymous: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participant_count: number;
  creator_display_name: string | null;
}

interface SalonMessage {
  id: number;
  room_id: number;
  user_id: number;
  is_anonymous: boolean;
  body: string;
  created_at: string;
  user_display_name: string | null;
  user_avatar_url: string | null;
  anonymous_name: string | null;
}

interface Participant {
  id: number;
  room_id: number;
  user_id: number;
  anonymous_name: string | null;
  joined_at: string;
  user_display_name: string | null;
  user_avatar_url: string | null;
}

const roomTypeLabels: Record<string, string> = {
  consultation: '相談',
  exchange: '交流',
  story: 'ストーリー',
  other: 'その他',
};

const SalonRoomDetailPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState<SalonRoom | null>(null);
  const [messages, setMessages] = useState<SalonMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchRoom = async () => {
    if (!token || !roomId) return;

    try {
      const response = await fetch(`${API_URL}/api/salon/rooms/${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else if (response.status === 403) {
        setError('このルームにアクセスする権限がありません');
      } else if (response.status === 404) {
        setError('ルームが見つかりません');
      } else {
        setError('ルームの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const fetchMessages = async () => {
    if (!token || !roomId) return;

    try {
      const response = await fetch(`${API_URL}/api/salon/rooms/${roomId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.reverse());
        setHasJoined(true);
      } else if (response.status === 403) {
        setHasJoined(false);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const fetchParticipants = async () => {
    if (!token || !roomId) return;

    try {
      const response = await fetch(`${API_URL}/api/salon/rooms/${roomId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRoom();
      await fetchMessages();
      await fetchParticipants();
      setLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      if (hasJoined) {
        fetchMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = async () => {
    if (!token || !roomId) return;

    setJoining(true);
    try {
      const params = new URLSearchParams();
      if (room?.allow_anonymous && anonymousName) {
        params.append('anonymous_name', anonymousName);
      }

      const response = await fetch(`${API_URL}/api/salon/rooms/${roomId}/join?${params}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setHasJoined(true);
        fetchMessages();
        fetchParticipants();
      } else {
        const data = await response.json();
        setError(data.detail || '参加に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token || !roomId || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`${API_URL}/api/salon/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: parseInt(roomId),
          body: newMessage.trim(),
          is_anonymous: isAnonymous,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        const data = await response.json();
        alert(data.detail || 'メッセージの送信に失敗しました');
      }
    } catch (err) {
      alert('ネットワークエラーが発生しました');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleParticipantClick = (participant: Participant) => {
    if (participant.user_id === user?.id) return;
    // Navigate to user profile page where they can send a message or view profile
    navigate(`/matching/users/${participant.user_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter key from submitting - only allow button click
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/salon')}>サロンに戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/salon')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate">{room.theme}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {roomTypeLabels[room.room_type]}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.participant_count}人
                </span>
                {room.allow_anonymous ? (
                  <span className="flex items-center gap-1">
                    <Unlock className="h-3 w-3" />
                    匿名可
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    実名のみ
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col">
          {!hasJoined ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <Card className="max-w-md w-full">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">ルームに参加</h2>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  
                  {room.allow_anonymous && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        匿名名（任意）
                      </label>
                      <Input
                        value={anonymousName}
                        onChange={(e) => setAnonymousName(e.target.value)}
                        placeholder="匿名で表示される名前"
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        匿名で発言する際に表示される名前です
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleJoinRoom}
                    disabled={joining}
                    className="w-full bg-black hover:bg-gray-800"
                  >
                    {joining ? '参加中...' : 'ルームに参加する'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    まだメッセージがありません。最初のメッセージを送ってみましょう！
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.user_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && (
                          <div className="flex-shrink-0">
                            {message.is_anonymous ? (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-gray-400" />
                              </div>
                            ) : message.user_avatar_url ? (
                              <img
                                src={message.user_avatar_url}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            isOwnMessage
                              ? 'bg-black text-white rounded-l-lg rounded-tr-lg'
                              : 'bg-white border rounded-r-lg rounded-tl-lg'
                          } p-3 shadow-sm`}
                        >
                          {!isOwnMessage && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-600">
                                {message.is_anonymous ? (message.anonymous_name || '匿名') : (message.user_display_name || 'ユーザー')}
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                          <div
                            className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-gray-300' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                        {isOwnMessage && (
                          <div className="flex-shrink-0">
                            {user?.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white border-t p-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="メッセージを入力..."
                      disabled={sendingMessage}
                    />
                    {room.allow_anonymous && (
                      <div className="flex items-center gap-2 mt-2">
                        <Checkbox
                          id="anonymous-message"
                          checked={isAnonymous}
                          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                        />
                        <label
                          htmlFor="anonymous-message"
                          className="text-xs text-gray-500 cursor-pointer"
                        >
                          匿名で送信
                        </label>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-black hover:bg-gray-800"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {showParticipants && (
          <div className="w-64 border-l bg-white p-4 hidden md:block">
            <h3 className="font-semibold mb-4">参加者 ({participants.length})</h3>
            <div className="space-y-3">
              {participants.map((p) => (
                <div 
                  key={p.id} 
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    p.user_id === user?.id 
                      ? 'bg-gray-50' 
                      : 'hover:bg-gray-100 cursor-pointer'
                  }`}
                  onClick={() => handleParticipantClick(p)}
                >
                  {p.user_avatar_url ? (
                    <img
                      src={p.user_avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.user_display_name || 'ユーザー'}
                    </p>
                    {p.anonymous_name && (
                      <p className="text-xs text-gray-500">
                        匿名: {p.anonymous_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonRoomDetailPage;
