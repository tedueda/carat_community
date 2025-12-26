import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IdentityBadge } from "@/components/ui/IdentityBadge";
import { API_URL } from "@/config";
import { createApiClient } from "@/lib/apiClient";
import { navigateToComposeOrChat } from "@/lib/chatNavigation";

type Item = {
  user_id: number;
  display_name?: string;
  identity?: string | null;
  prefecture?: string | null;
  age_band?: string | null;
  avatar_url?: string | null;
};

export function MatchCard({ item }: { item: Item }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading || liked) return;
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/matching/likes/${item.user_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Like failed');
      const data = await res.json();
      setLiked(true);
      
      if (data.matched) {
        alert('✨ マッチしました！');
        navigate('/matching/matches');
      } else {
        navigate('/matching/likes');
      }
    } catch (err) {
      console.error("Like failed:", err);
      alert('いいねに失敗しました');
    } finally {
      setLoading(false);
    }
  }
  function handleCardClick() {
    navigate(`/matching/users/${item.user_id}`);
  }

  async function handleMessage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/matching/compose/${item.user_id}`);
      return;
    }
    
    try {
      const apiClient = createApiClient(() => token);
      const userStr = localStorage.getItem('user');
      const currentUserId = userStr ? JSON.parse(userStr).id : null;
      await navigateToComposeOrChat(apiClient, navigate, item.user_id, currentUserId);
    } catch (err) {
      console.error('Failed to navigate to chat:', err);
      alert('エラーが発生しました');
    }
  }

  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 画像エリア - 縦長レイアウト */}
      <div className="block relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
        {item.avatar_url && !item.avatar_url.includes('dicebear') ? (
          <img
            src={item.avatar_url.startsWith('http') ? item.avatar_url : `${API_URL}${item.avatar_url}`}
            alt={`${item.display_name || "ユーザー"}のプロフィール画像`}
            className="h-full w-full object-cover"
            loading="lazy"
            key={`${item.user_id}-${item.avatar_url}`}
            onError={(e) => {
              // エラー時は画像を非表示にする
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">👤</span>
            </div>
          </div>
        )}
        
        {/* 性自認バッジ（右上） */}
        {item.identity && (
          <div className="absolute right-2 top-2">
            <IdentityBadge value={item.identity} />
          </div>
        )}
        
        {/* 下部情報オーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-bold truncate">{item.display_name || `User ${item.user_id}`}</span>
            <span className="text-xs opacity-90">{item.age_band}</span>
          </div>
          <div className="text-xs opacity-75">
            📍 {item.prefecture}
          </div>
        </div>
      </div>

      {/* アクションボタン - コンパクト */}
      <div className="p-2">
        <div className="flex gap-1">
          <button
            onClick={handleLike}
            disabled={loading || liked}
            aria-label={`${item.display_name || "このユーザー"}をお気に入りに追加`}
            className={`
              flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all
              ${liked 
                ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                : "bg-black text-white hover:bg-gray-800 active:scale-95"
              }
              ${loading ? "opacity-50 cursor-wait" : ""}
            `}
          >
            {liked ? "💎 お気に入り" : "💎 お気に入り"}
          </button>
          <button
            onClick={handleMessage}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-center text-xs font-medium text-gray-700 transition-all hover:bg-gray-100 active:scale-95"
            aria-label={`${item.display_name || "このユーザー"}とチャットする`}
          >
            チャットをする
          </button>
        </div>
      </div>
    </article>
  );
}

export default MatchCard;
