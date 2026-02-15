import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Heart, MessageCircle, Play, Search, Home } from 'lucide-react';
import { Post, User } from '../../types/Post';

const FoodPage: React.FC = () => {
  const { user, isAnonymous, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  // 画像URL解決: /images/ はフロント配信なのでそのまま。/media,/uploads はAPIにぶら下げる。
  const resolveImageUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('/images/')) return url; // frontend/public/images 配信
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-carat-gray1 flex items-center justify-center">
        <div className="text-center text-carat-gray5">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-carat-black mx-auto mb-4"></div>
          読み込み中...
        </div>
      </div>
    );
  }

  // 未ログイン時の制御
  if (!user || isAnonymous) {
    return (
      <div className="min-h-screen bg-carat-gray1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-carat-white rounded-2xl border border-carat-gray2 shadow-card p-8 text-center">
          <h1 className="text-2xl font-bold text-carat-black mb-4">会員限定ページです</h1>
          <p className="text-carat-gray5 mb-6">
            食レポは会員限定コンテンツです。<br />
            ログインしてご利用ください。
          </p>
          <Link
            to="/login"
            className="inline-block bg-carat-black text-carat-white px-6 py-3 rounded-full font-medium hover:bg-carat-gray6 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  const subcategories = [
    { value: 'all', label: 'すべて' },
    { value: 'restaurant', label: '外食' },
    { value: 'side-dish', label: '惣菜・おかず' },
    { value: 'noodles', label: '麺・スープ' },
    { value: 'sweets', label: 'スイーツ・デザート' },
    { value: 'drinks', label: 'ドリンク' },
    { value: 'bread', label: 'パン・お菓子' },
    { value: 'frozen', label: '冷凍食品' },
    { value: 'special', label: 'ふるさと納税・お取り寄せ' },
  ];

  const fetchPosts = async () => {
    try {
      const headers: any = {
        'Authorization': `Bearer ${token}`,
      };
      
      console.log('🍽 Fetching food posts from:', `${API_URL}/api/posts/?category=food`);
      const response = await fetch(`${API_URL}/api/posts/?category=food`, {
        headers,
      });

      console.log('📡 Response status:', response.status, response.ok);
      if (response.ok) {
        const postsData = await response.json();
        console.log('📦 Posts received:', postsData.length, postsData);
        setPosts(postsData);

        // ユーザー情報を取得
        const userIds = [...new Set(postsData.map((post: Post) => post.user_id))];
        const usersData: { [key: number]: User } = {};
        
        for (const userId of userIds) {
          try {
            const userResponse = await fetch(`${API_URL}/api/users/${userId}`, {
              headers,
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId as number] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
        
        setUsers(usersData);
      } else {
        setError('投稿の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラー');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token && !isLoading) {
      console.log('🔄 Starting fetchPosts with token:', !!token);
      fetchPosts();
    }
  }, [user, token, isLoading]);

  // YouTube動画IDを抽出する関数
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // フィルタリングされた投稿
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubcategory = selectedSubcategory === 'all' || 
      post.subcategory === selectedSubcategory;
    
    return matchesSearch && matchesSubcategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-carat-gray1 flex items-center justify-center">
        <div className="text-center text-carat-gray5">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-carat-gray1 flex items-center justify-center p-4">
        <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carat-gray1">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* ホームに戻るボタン */}
        <div className="pt-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-carat-gray6 hover:text-carat-black"
          >
            <Home className="h-5 w-5" />
            ホームに戻る
          </Button>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-carat-black mb-4">
            🍽 食レポ
          </h1>
          <p className="text-carat-gray5 mb-6">
            会員限定・単品メニュー・市販品の"秘密の推し"を共有
          </p>
          
          <Link
            to="/members/food/new"
            className="inline-block bg-carat-black text-carat-white px-6 py-3 rounded-full font-medium hover:bg-carat-gray6 transition-colors"
          >
            新しい食レポを投稿
          </Link>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-carat-white rounded-2xl border border-carat-gray2 shadow-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carat-gray4 h-4 w-4" />
              <input
                type="text"
                placeholder="商品名やキーワードで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-carat-gray3 rounded-full focus:outline-none focus:ring-2 focus:ring-carat-black/20"
              />
            </div>
            
            {/* カテゴリフィルター */}
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="px-4 py-2 border border-carat-gray3 rounded-full focus:outline-none focus:ring-2 focus:ring-carat-black/20"
              aria-label="カテゴリを選択"
            >
              {subcategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            {/* ソート */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
              className="px-4 py-2 border border-carat-gray3 rounded-full focus:outline-none focus:ring-2 focus:ring-carat-black/20"
              aria-label="並び順を選択"
            >
              <option value="latest">新着順</option>
              <option value="popular">人気順</option>
            </select>
          </div>
        </div>

        {/* 投稿一覧 */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽</div>
            <h3 className="text-xl font-semibold text-carat-gray6 mb-2">まだ食レポがありません</h3>
            <p className="text-carat-gray5 mb-6">最初の食レポを投稿してみませんか？（会員限定）</p>
            <Link
              to="/members/food/new"
              className="inline-block bg-carat-black text-carat-white px-6 py-3 rounded-full font-medium hover:bg-carat-gray6 transition-colors"
            >
              食レポを投稿
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="bg-carat-white border-carat-gray2 shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                {/* サムネイル */}
                {(post.media_url || (post.media_urls && post.media_urls.length > 0)) ? (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={post.media_url ? resolveImageUrl(post.media_url) : resolveImageUrl(post.media_urls![0])}
                      alt={post.title || '食レポ画像'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = `https://picsum.photos/seed/food-${post.id}/400/300`;
                      }}
                    />
                  </div>
                ) : post.youtube_url ? (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={`https://i.ytimg.com/vi/${extractYouTubeVideoId(post.youtube_url)}/hqdefault.jpg`}
                      alt={post.title || 'YouTube動画'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = `https://picsum.photos/seed/food-${post.id}/400/300`;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-carat-black text-carat-white p-3 rounded-full">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-carat-gray2 flex items-center justify-center">
                    <div className="text-6xl">🍽</div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-carat-gray2 rounded-full flex items-center justify-center">
                        <span className="text-carat-gray6 font-semibold text-sm">
                          {(post.user_display_name || 'テッドさん').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-carat-black text-sm">
                          {post.user_display_name || 'テッドさん'}
                        </h3>
                        <p className="text-xs text-carat-gray5">
                          {new Date(post.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {post.title && (
                    <h2 className="text-lg font-bold text-carat-black mb-2 line-clamp-2">{post.title}</h2>
                  )}
                  <p className="text-carat-gray6 text-sm line-clamp-3 mb-4">{post.body}</p>
                  
                  <div className="flex items-center gap-4 pt-3 border-t border-carat-gray2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-carat-gray5 hover:text-carat-black hover:bg-carat-gray1"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{post.like_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-carat-gray5 hover:text-carat-black hover:bg-carat-gray1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comment_count || 0}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default FoodPage;
