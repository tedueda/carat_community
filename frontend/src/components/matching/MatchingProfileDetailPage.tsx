import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { IdentityBadge } from '@/components/ui/IdentityBadge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// アイコンコンポーネント
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
);
const MessageCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);

type ProfileData = {
  user_id: number;
  display_name: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
};

type MatchData = {
  match_id: number;
  user_id: number;
};

type ChatData = {
  chat_id: number;
  with_user_id: number;
};

const MatchingProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const userId = Number(id);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [liked, setLiked] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      
      try {
        // プロフィール情報は search API から取得した想定（実際は一覧から遷移）
        // 暫定: 最小限のデータで構築
        setProfile({
          user_id: userId,
          display_name: `ユーザー #${userId}`,
          identity: null,
          prefecture: null,
          age_band: null,
          avatar_url: null,
        });

        // マッチ状態確認
        const matchesRes = await fetch(`${API_URL}/api/matching/matches`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          const matches: MatchData[] = matchesData?.items || [];
          const match = matches.find((m: MatchData) => m.user_id === userId);
          
          if (match) {
            setIsMatched(true);
            // チャットID取得
            const chatsRes = await fetch(`${API_URL}/api/matching/chats`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (chatsRes.ok) {
              const chatsData = await chatsRes.json();
              const chats: ChatData[] = chatsData?.items || [];
              const chat = chats.find((c: ChatData) => c.with_user_id === userId);
              if (chat) {
                setChatId(chat.chat_id);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, token]);

  async function handleLike() {
    if (likeLoading || liked || !token) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/matching/likes/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Like failed');
      
      const data = await res.json();
      setLiked(true);
      
      if (data?.matched) {
        setIsMatched(true);
        if (data?.match_id) {
          // マッチ成立時はチャットIDを取得し直す
          const chatsRes = await fetch(`${API_URL}/api/matching/chats`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (chatsRes.ok) {
            const chatsData = await chatsRes.json();
            const chats: ChatData[] = chatsData?.items || [];
            const chat = chats.find((c: ChatData) => c.with_user_id === userId);
            if (chat) {
              setChatId(chat.chat_id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Like failed:", err);
      alert('いいねに失敗しました');
    } finally {
      setLikeLoading(false);
    }
  }

  function handleMessage() {
    if (!chatId) return;
    navigate(`/matching/chats/${chatId}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">プロフィールが見つかりません</p>
          <Link to="/matching" className="mt-4 inline-block text-blue-600 hover:underline">
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50/30 pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            to="/matching"
            className="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900"
            aria-label="一覧に戻る"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">
            {profile.display_name}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              disabled={likeLoading || liked}
              aria-label="タイプを送る"
              className={`rounded-full p-2 transition-all ${
                liked
                  ? "bg-pink-100 text-pink-600"
                  : "bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            </button>
            {isMatched && chatId && (
              <button
                onClick={handleMessage}
                aria-label="メッセージを送る"
                className="rounded-full bg-yellow-500 p-2 text-white transition-all hover:bg-yellow-600"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* 画像エリア */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg">
          <div className="aspect-[4/3]">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${profile.avatar_url}`}
                alt={`${profile.display_name}のプロフィール画像`}
                className="h-full w-full object-cover"
                key={`profile-${profile.user_id}-${profile.avatar_url}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-bold text-gray-400">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* 性自認バッジ（左上） */}
          {profile.identity && (
            <div className="absolute left-4 top-4">
              <IdentityBadge value={profile.identity} />
            </div>
          )}
        </div>

        {/* 基本情報セクション */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">基本情報</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {profile.age_band && (
              <div>
                <dt className="text-sm font-medium text-gray-500">年齢</dt>
                <dd className="mt-1 text-base text-gray-900">{profile.age_band}</dd>
              </div>
            )}
            {profile.prefecture && (
              <div>
                <dt className="text-sm font-medium text-gray-500">地域</dt>
                <dd className="mt-1 text-base text-gray-900">{profile.prefecture}</dd>
              </div>
            )}
            {profile.identity && (
              <div>
                <dt className="text-sm font-medium text-gray-500">性自認</dt>
                <dd className="mt-1">
                  <IdentityBadge value={profile.identity} />
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p>※ 詳細なプロフィール情報は、マッチング後にご覧いただけます。</p>
          </div>
        </section>

        {/* 自己紹介セクション（準備中） */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">自己紹介</h2>
          <p className="text-sm text-gray-500">情報非公開</p>
        </section>
      </main>

      {/* 下部固定CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl gap-3">
          <button
            onClick={handleLike}
            disabled={likeLoading || liked}
            className={`flex-1 rounded-lg px-6 py-3 text-base font-semibold transition-all ${
              liked
                ? "bg-pink-100 text-pink-700"
                : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 active:scale-95"
            }`}
          >
            {liked ? "♡ タイプ済み" : "♡ タイプに追加"}
          </button>
          <button
            onClick={handleMessage}
            disabled={!isMatched || !chatId}
            className={`flex-1 rounded-lg px-6 py-3 text-base font-semibold transition-all ${
              isMatched && chatId
                ? "bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {isMatched && chatId ? "メッセージを送る" : "マッチング後に送信可"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingProfileDetailPage;
