import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender_display_name?: string;
}

interface ChatInfo {
  id: number;
  item_id: number;
  item_title: string;
  buyer_id: number;
  seller_id: number;
  buyer_display_name: string;
  seller_display_name: string;
}

const FleaMarketChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (chatId) {
      fetchChatInfo();
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/flea-market/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const chats = await response.json();
        const chat = chats.find((c: ChatInfo) => c.id === parseInt(chatId!));
        if (chat) {
          setChatInfo(chat);
        }
      }
    } catch (error) {
      console.error('チャット情報の取得に失敗:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/flea-market/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('メッセージの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/flea-market/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        alert('メッセージの送信に失敗しました');
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherUserName = chatInfo
    ? (chatInfo.buyer_id === user?.id ? chatInfo.seller_display_name : chatInfo.buyer_display_name)
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/business')}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="戻る"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">{otherUserName}さんとのチャット</h1>
            {chatInfo && (
              <p className="text-sm text-gray-500">{chatInfo.item_title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">メッセージを送信して会話を始めましょう</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMyMessage
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMyMessage ? 'text-pink-100' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="送信"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleaMarketChatPage;
