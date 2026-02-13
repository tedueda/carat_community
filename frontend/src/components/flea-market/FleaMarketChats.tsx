import React, { useState, useEffect } from 'react';
import { MessageCircle, Package, User, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config';

interface Chat {
  id: number;
  item_id: number;
  buyer_id: number;
  seller_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  item_title: string;
  buyer_display_name: string;
  seller_display_name: string;
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  body: string;
  created_at: string;
}


const FleaMarketChats: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // URLパラメータからchatIdを読み取り、該当するチャットを自動的に開く
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    console.log('URLパラメータのchatId:', chatId);
    console.log('現在のチャット一覧:', chats);
    console.log('選択中のチャット:', selectedChat);
    
    if (chatId && chats.length > 0 && !selectedChat) {
      const chatIdNum = parseInt(chatId);
      console.log('検索するchatId:', chatIdNum);
      const chat = chats.find(c => c.id === chatIdNum);
      console.log('見つかったチャット:', chat);
      
      if (chat) {
        console.log('チャットを自動選択:', chat);
        setSelectedChat(chat);
      } else {
        console.error(`chatId=${chatIdNum}のチャットが見つかりません`);
      }
    }
  }, [searchParams, chats, selectedChat]);

  const fetchChats = async () => {
    try {
      console.log('チャット一覧を取得中...');
      const response = await fetch(`${API_URL}/api/flea-market/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('取得したチャット一覧:', data);
        setChats(data);
      } else {
        console.error('チャット一覧の取得に失敗:', response.status, await response.text());
      }
    } catch (error) {
      console.error('チャット一覧の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    console.log('メッセージ取得中... chatId:', chatId, 'API_URL:', API_URL);
    try {
      const response = await fetch(`${API_URL}/api/flea-market/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('メッセージ取得レスポンス:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('取得したメッセージ:', data);
        setMessages(data);
      } else {
        console.error('メッセージ取得失敗:', response.status);
      }
    } catch (error) {
      console.error('メッセージの取得に失敗しました:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`${API_URL}/api/flea-market/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: newMessage.trim() }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedChat.id);
      }
    } catch (error) {
      console.error('メッセージの送信に失敗しました:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (selectedChat) {
    const otherUser = selectedChat.buyer_id === user?.id 
      ? selectedChat.seller_display_name 
      : selectedChat.buyer_display_name;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedChat(null)}
              className="flex items-center text-gray-700 hover:text-gray-900 mb-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              チャット一覧に戻る
            </button>
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-gray-600" />
              <div>
                <h2 className="font-semibold text-gray-900">{selectedChat.item_title}</h2>
                <p className="text-sm text-gray-600">{otherUser}さんとのチャット</p>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">まだメッセージがありません</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMyMessage = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isMyMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMyMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="メッセージを入力..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sendingMessage}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">フリマチャット</h2>
        <p className="text-gray-600">商品についての取引相手とのメッセージ</p>
      </div>

      {chats.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">チャットがありません</h3>
          <p className="text-gray-500">商品の「連絡する」ボタンからチャットを開始できます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const otherUser = chat.buyer_id === user?.id 
              ? chat.seller_display_name 
              : chat.buyer_display_name;
            const role = chat.buyer_id === user?.id ? '購入希望' : '出品者';

            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{chat.item_title}</h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDate(chat.updated_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {otherUser}さん（{role}）
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>最終更新: {formatDate(chat.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FleaMarketChats;
