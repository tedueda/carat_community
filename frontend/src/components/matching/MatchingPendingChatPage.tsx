import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';

type ChatRequestInfo = {
  request_id: number;
  from_user_id: number;
  to_user_id: number;
  status: string;
  from_display_name?: string;
  to_display_name?: string;
  from_avatar_url?: string;
  to_avatar_url?: string;
  initial_message?: string;
  created_at?: string;
};

type Message = {
  id: number;
  from_user_id: number;
  content: string;
  created_at: string;
  image_url?: string;
};

interface MatchingPendingChatPageProps {
  embedded?: boolean;
}

const MatchingPendingChatPage: React.FC<MatchingPendingChatPageProps> = ({ embedded = false }) => {
  const { requestId } = useParams<{ requestId: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [requestInfo, setRequestInfo] = useState<ChatRequestInfo | null>(null);
  const [foundInList, setFoundInList] = useState<'outgoing' | 'incoming' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequestInfo = async () => {
    if (!token || !requestId) return;
    try {
      const [outgoingRes, incomingRes] = await Promise.all([
        fetch(`${API_URL}/api/matching/chat_requests/outgoing`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/matching/chat_requests/incoming`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      
      if (!outgoingRes.ok || !incomingRes.ok) throw new Error('Failed to fetch request info');
      
      const outgoingData = await outgoingRes.json();
      const incomingData = await incomingRes.json();
      
      const outgoingList = Array.isArray(outgoingData?.items) ? outgoingData.items : [];
      const incomingList = Array.isArray(incomingData?.items) ? incomingData.items : [];
      
      let request = outgoingList.find((r: any) => r.request_id === parseInt(requestId));
      let foundIn: 'outgoing' | 'incoming' | null = null;
      
      if (request) {
        foundIn = 'outgoing';
      } else {
        request = incomingList.find((r: any) => r.request_id === parseInt(requestId));
        if (request) {
          foundIn = 'incoming';
        }
      }
      
      if (request) {
        setRequestInfo(request);
        setFoundInList(foundIn);
        
        if (request.status === 'accepted') {
          const targetUserId = request.to_user_id || request.from_user_id;
          const chatRes = await fetch(`${API_URL}/api/matching/ensure_chat/${targetUserId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            navigate(`/matching/chats/${chatData.chat_id}`);
          }
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch request info:', e);
    }
  };

  const fetchMessages = async () => {
    if (!token || !requestId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e: any) {
      console.error('Failed to fetch messages:', e);
    }
  };

  useEffect(() => {
    fetchRequestInfo();
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, requestId]);

  const handleAccept = async () => {
    if (!token || !requestId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || '承諾に失敗しました');
      }
      const data = await res.json();
      if (data.chat_id) {
        navigate(`/matching/chats/${data.chat_id}`, { replace: true });
      }
    } catch (e: any) {
      console.error('Accept error:', e);
      alert(`エラー: ${e?.message || '承諾に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!token || !requestId) return;
    if (!confirm('このリクエストを辞退しますか？')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/decline`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || '辞退に失敗しました');
      }
      navigate('/matching/chats', { replace: true });
    } catch (e: any) {
      console.error('Decline error:', e);
      alert(`エラー: ${e?.message || '辞退に失敗しました'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!requestInfo) {
    return <div className="p-4">読み込み中...</div>;
  }

  const isSender = requestInfo.from_user_id 
    ? requestInfo.from_user_id === user?.id 
    : foundInList === 'outgoing';
  const isRecipient = requestInfo.to_user_id 
    ? requestInfo.to_user_id === user?.id 
    : foundInList === 'incoming';
  const isAccepted = requestInfo.status === 'accepted';

  return (
    <div className="flex flex-col h-full">
      {!embedded && (
        <div className="pb-3 border-b mb-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black"
          >
            ← 戻る
          </button>
        </div>
      )}

      {isSender && !isAccepted && (
        <div className="flex flex-col h-full">
          {/* Banner */}
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center gap-2">
            <span className="text-yellow-600">⏳</span>
            <div className="text-sm text-yellow-800">
              承諾待ち - 相手が承諾するとチャットが開始されます
            </div>
          </div>

          {/* Message Display */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="flex justify-end mb-4">
                    <div className="bg-black text-white rounded-lg px-4 py-2 max-w-[70%]">
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-gray-300 mt-1">未読</div>
                    </div>
                  </div>
                ))
              ) : requestInfo.initial_message ? (
                <div className="flex justify-end mb-4">
                  <div className="bg-black text-white rounded-lg px-4 py-2 max-w-[70%]">
                    <div className="text-sm">{requestInfo.initial_message}</div>
                    <div className="text-xs text-gray-300 mt-1">未読</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Input Area (disabled) */}
          <div className="border-t-2 border-gray-400 bg-white p-4 pb-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 opacity-50">
                <textarea
                  disabled
                  placeholder="相手が承諾するまでメッセージを送信できません"
                  className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg resize-none bg-gray-100 cursor-not-allowed"
                  rows={2}
                />
                <button
                  disabled
                  className="bg-black text-white p-3 rounded-full cursor-not-allowed opacity-50"
                >
                  <span className="text-xl">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRecipient && !isAccepted && (
        <div className="flex flex-col h-full">
          {/* Message Display */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="flex justify-start mb-4">
                    <div className="flex items-start gap-2 max-w-[70%]">
                      {requestInfo.from_avatar_url && (
                        <img
                          src={requestInfo.from_avatar_url.startsWith('http') ? requestInfo.from_avatar_url : `${API_URL}${requestInfo.from_avatar_url}`}
                          alt={requestInfo.from_display_name || 'ユーザー'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <div className="text-sm">{msg.content}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : requestInfo.initial_message ? (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start gap-2 max-w-[70%]">
                    {requestInfo.from_avatar_url && (
                      <img
                        src={requestInfo.from_avatar_url.startsWith('http') ? requestInfo.from_avatar_url : `${API_URL}${requestInfo.from_avatar_url}`}
                        alt={requestInfo.from_display_name || 'ユーザー'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                      <div className="text-sm">{requestInfo.initial_message}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="font-medium text-sm mb-1">
                  {requestInfo.from_display_name || 'ユーザー'}さんからチャットリクエスト
                </div>
                <div className="text-xs text-gray-600">
                  承諾するとチャットが開始されます
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  承諾
                </button>
                <button
                  onClick={handleDecline}
                  disabled={loading}
                  className="flex-1 bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  辞退
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingPendingChatPage;
