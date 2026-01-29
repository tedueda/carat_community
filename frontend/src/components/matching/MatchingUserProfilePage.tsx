import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import { createApiClient } from '@/lib/apiClient';
import { navigateToComposeOrChat } from '@/lib/chatNavigation';
import { Lock } from 'lucide-react';

type UserProfile = {
  user_id: number;
  display_name: string;
  nickname?: string;
  avatar_url?: string;
  nationality?: string;
  age_band?: string;
  prefecture?: string;
  residence_detail?: string;
  hometown?: string;
  occupation?: string;
  blood_type?: string;
  zodiac?: string;
  meet_pref?: string;
  bio?: string;
  identity?: string;
  romance_targets?: string[];
  hobbies?: string[];
  images?: Array<{ id: number; image_url: string; order?: number }>;
};

const getFlagEmoji = (code: string | null | undefined): string => {
  if (!code) return '';
  const flagMap: Record<string, string> = {
    'JP': '🇯🇵', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'PT': '🇵🇹', 'NL': '🇳🇱',
    'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
    'FI': '🇫🇮', 'IE': '🇮🇪', 'KR': '🇰🇷', 'CN': '🇨🇳', 'TW': '🇹🇼', 'HK': '🇭🇰',
    'SG': '🇸🇬', 'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'MY': '🇲🇾',
    'IN': '🇮🇳', 'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
    'PE': '🇵🇪', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'IL': '🇮🇱', 'AE': '🇦🇪', 'RU': '🇷🇺',
    'PL': '🇵🇱', 'CZ': '🇨🇿', 'GR': '🇬🇷', 'TR': '🇹🇷', 'OTHER': '🌍',
  };
  return flagMap[code] || '🌍';
};

const MatchingUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  // 有料会員かどうか
  const isPaidUser = user?.membership_type === 'premium' || user?.membership_type === 'admin';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !userId || !isPaidUser) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/matching/profiles/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('プロフィールの取得に失敗しました');
        const data = await res.json();
        const normalizedData = {
          ...data,
          images: (data.images || []).map((img: any) => ({
            id: img.id,
            image_url: img.image_url ?? img.url,
            order: img.order ?? img.display_order,
          })),
        };
        setProfile(normalizedData);
      } catch (e: any) {
        setError(e?.message || 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, userId, isPaidUser]);

  // 有料会員でない場合はアップグレード画面を表示
  if (!isPaidUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Lock className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">有料会員限定機能</h2>
        <p className="text-gray-600 mb-6 text-center">
          会員プロフィールの閲覧は有料会員のみご利用いただけます。
        </p>
        <button
          onClick={() => navigate('/account')}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
        >
          有料会員になる
        </button>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!token || !userId) return;
    
    try {
      const apiClient = createApiClient(() => token);
      await navigateToComposeOrChat(apiClient, navigate, parseInt(userId), user?.id || null);
    } catch (e) {
      console.error('Failed to navigate to chat:', e);
      alert('エラーが発生しました');
    }
  };

  const handleLike = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`${API_URL}/api/matching/likes/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('いいねに失敗しました');
      alert('❤️ いいね！を送信しました');
      navigate('/matching/matches');
    } catch (e: any) {
      alert(`エラー: ${e?.message || 'いいねに失敗しました'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'プロフィールが見つかりません'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-black"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-semibold text-black">{profile.display_name}</h1>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto">
        {/* Image Gallery */}
        <div className="relative mx-auto max-w-xl md:max-w-2xl max-h-[420px] md:max-h-[480px] aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-4 md:mb-0">
          {/* 国旗バッジ（右上） */}
          {profile.nationality && (
            <div className="absolute right-3 top-3 bg-white/90 rounded-full px-3 py-1.5 shadow-md z-20">
              <span className="text-2xl">{getFlagEmoji(profile.nationality)}</span>
            </div>
          )}
          {profile.images && profile.images.length > 0 ? (
            <>
              <img
                src={profile.images[currentImageIndex].image_url && profile.images[currentImageIndex].image_url.startsWith('http') 
                  ? profile.images[currentImageIndex].image_url 
                  : profile.images[currentImageIndex].image_url 
                    ? `${API_URL}${profile.images[currentImageIndex].image_url}`
                    : ''}
                alt={`${profile.display_name} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {profile.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + profile.images!.length) % profile.images!.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % profile.images!.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {profile.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : profile.avatar_url ? (
            <img
              src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${API_URL}${profile.avatar_url}`}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">😊</span>
            </div>
          )}
        </div>

        {/* Mobile Action Buttons - Below Image */}
        <div className="md:hidden px-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all bg-black text-white hover:bg-gray-800 active:scale-95"
            >
              ♡ お気に入り
            </button>
            <button
              onClick={handleSendMessage}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-all bg-white hover:bg-gray-50 active:scale-95 border border-gray-300"
            >
              チャットをする
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">{profile.display_name}</h2>
            {profile.nickname && profile.nickname !== profile.display_name && (
              <div className="text-gray-600 mb-2">ニックネーム: {profile.nickname}</div>
            )}
            <div className="text-gray-600 space-y-1">
              {profile.age_band && <div>年齢: {profile.age_band}</div>}
              {profile.prefecture && (
                <div>
                  居住地: {profile.prefecture}
                  {profile.residence_detail && ` ${profile.residence_detail}`}
                </div>
              )}
              {profile.hometown && <div>出身地: {profile.hometown}</div>}
              {profile.occupation && <div>職業: {profile.occupation}</div>}
              <div>血液型: {profile.blood_type || '未設定'}</div>
              <div>星座: {profile.zodiac || '未設定'}</div>
            </div>
          </div>

          {/* Identity & Romance Targets */}
          {profile.identity && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">アイデンティティ</h3>
              <div className="text-gray-700">{profile.identity}</div>
            </div>
          )}

          {profile.romance_targets && profile.romance_targets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">恋愛対象</h3>
              <div className="flex flex-wrap gap-2">
                {profile.romance_targets.map((target, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-200">
                    {target}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meet Preference */}
          {profile.meet_pref && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">出会いの目的</h3>
              <div className="text-gray-700">{profile.meet_pref}</div>
            </div>
          )}

          {/* Self Introduction */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">自己紹介</h3>
              <div className="text-gray-700 whitespace-pre-wrap">{profile.bio}</div>
            </div>
          )}

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">趣味</h3>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-200">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sticky Bottom Action Bar */}
      <div className="hidden md:block fixed bottom-4 left-4 right-4 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={handleLike}
            className="flex-1 rounded-full px-6 py-4 text-base font-semibold transition-all bg-black text-white hover:bg-gray-800 active:scale-95 shadow-xl"
          >
            ♡ お気に入り
          </button>
          <button
            onClick={handleSendMessage}
            className="flex-1 rounded-full px-6 py-4 text-base font-semibold text-gray-800 transition-all bg-white hover:bg-gray-50 active:scale-95 shadow-xl border border-gray-200"
          >
            💬 チャットをする
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingUserProfilePage;
