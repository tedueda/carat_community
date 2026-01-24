import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

type ChatItem = {
  chat_id: number;
  with_user_id: number;
  with_display_name: string;
  last_message?: string;
};

type ChatRequest = {
  request_id: number;
  from_user_id: number;
  from_display_name: string;
  from_avatar_url?: string;
  identity?: string;
  prefecture?: string;
  age_band?: string;
  initial_message?: string;
  created_at?: string;
};

const MatchingChatsPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  // ログイン状態と有料会員かどうか
  const isLoggedIn = !!user;
  const isPaidUser = user?.membership_type === 'premium' || user?.membership_type === 'admin';
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchChats = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/matching/chats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/incoming`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRequests(data.items || []);
    } catch (e: any) {
      console.error('Failed to fetch requests:', e);
    }
  };

  const handleAccept = async (requestId: number) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      alert('✅ チャットリクエストを承諾しました！');
      await fetchRequests();
      await fetchChats();
      if (data.chat_id) {
        window.location.href = `/matching/chats/${data.chat_id}`;
      }
    } catch (e: any) {
      alert('承諾に失敗しました: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_URL}/api/matching/chat_requests/${requestId}/decline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      alert('❌ チャットリクエストを辞退しました');
      await fetchRequests();
    } catch (e: any) {
      alert('辞退に失敗しました: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (isPaidUser) {
      fetchChats();
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isPaidUser]);

  // 未ログインの場合は会員登録を促す
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">会員登録してください</h2>
          <p className="text-gray-600 mb-6">
            マッチング機能は会員限定サービスです。<br />
            会員登録して、素敵な出会いを見つけましょう。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              新規会員登録
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              ログイン
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            有料会員になると、チャット機能をご利用いただけます。<br />
            月額1,000円・いつでも解約可能
          </p>
        </div>
      </div>
    );
  }

  // 有料会員でない場合はアップグレード画面を表示
  if (!isPaidUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Lock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">有料会員限定機能</h2>
          <p className="text-gray-600 mb-6">
            チャット機能は有料会員のみご利用いただけます。<br />
            有料会員になって、マッチング相手とチャットしましょう。
          </p>
          <button
            onClick={() => navigate('/account')}
            className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
          >
            有料会員になる
          </button>
          <p className="text-sm text-gray-500 mt-4">
            月額1,000円・いつでも解約可能
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">受信したメールリクエスト</h2>
          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <ul className="space-y-3">
              {requests.map((req) => (
                <li key={req.request_id} className="border rounded p-3 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {req.from_avatar_url ? (
                        <img 
                          src={req.from_avatar_url.startsWith('http') ? req.from_avatar_url : `${API_URL}${req.from_avatar_url}`}
                          alt={req.from_display_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500">👤</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{req.from_display_name}</div>
                      <div className="text-xs text-gray-600">
                        {[req.age_band, req.prefecture].filter(Boolean).join(' ・ ')}
                      </div>
                      {req.initial_message && (
                        <div className="mt-1 text-sm text-gray-700">{req.initial_message}</div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleAccept(req.request_id)}
                          disabled={actionLoading === req.request_id}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          承諾
                        </button>
                        <button
                          onClick={() => handleDecline(req.request_id)}
                          disabled={actionLoading === req.request_id}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                          辞退
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">チャット</h2>
        <div className="p-4 border rounded-lg bg-white">
          <div className="mb-3 flex gap-2">
            <button onClick={() => { fetchChats(); fetchRequests(); }} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">再取得</button>
          </div>
          {loading && <div>読み込み中...</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.chat_id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.with_display_name}</div>
                  <div className="text-xs text-gray-600">{c.last_message || 'メッセージはまだありません'}</div>
                </div>
                <a href={`/matching/chats/${c.chat_id}`} className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700">開く</a>
              </li>
            ))}
            {!loading && !error && items.length === 0 && (
              <li className="text-sm text-gray-500">チャットはまだありません。</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatchingChatsPage;
