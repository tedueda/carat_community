import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, MessageCircle, Filter, SortAsc } from 'lucide-react';
import PostDetailModal from './PostDetailModal';
import NewPostForm from './NewPostForm';
import LikeButton from './common/LikeButton';
import { Post } from '../types/Post';
import { getYouTubeThumbnail, extractYouTubeUrlFromText } from '../utils/youtube';
import { getPostImageUrl } from '../utils/imageUtils';


const categories = {
  board: { 
    title: "掲示板", 
    emoji: "💬", 
    desc: "悩み相談や雑談、生活の話題。本当の自分を発信し、共感できる仲間とつながる居場所", 
    slug: "board",
    seoKeywords: "LGBTQ 相談,カミングアウト 相談,悩み相談,共感,居場所,仲間とつながる"
  },
  art: { 
    title: "アート", 
    emoji: "🎨", 
    desc: "イラスト・写真・映像作品の発表。自己表現を通じて本当の自分を表現", 
    slug: "art",
    seoKeywords: "LGBTQ アート,自己表現,作品発表,クリエイティブ"
  },
  music: { 
    title: "音楽", 
    emoji: "🎵", 
    desc: "お気に入りや自作・AI曲の共有。音楽で自分らしさを表現", 
    slug: "music",
    seoKeywords: "LGBTQ 音楽,音楽共有,自分らしく"
  },
  shops: { 
    title: "お店", 
    emoji: "🏬", 
    desc: "LGBTQフレンドリーなお店紹介。安心して過ごせる居場所を見つける", 
    slug: "shops",
    seoKeywords: "LGBTQ フレンドリー,お店,安心,居場所"
  },
  tourism: { 
    title: "ツーリズム", 
    emoji: "📍", 
    desc: "会員ガイドの交流型ツアー。仲間と一緒に新しい体験", 
    slug: "tourism",
    seoKeywords: "LGBTQ ツアー,交流,仲間,体験"
  },
  comics: { 
    title: "コミック・映画", 
    emoji: "🎬", 
    desc: "LGBTQ+テーマの作品レビューと感想。共感できる物語を共有", 
    slug: "comics",
    seoKeywords: "LGBTQ 映画,コミック,レビュー,共感"
  },
  news: { 
    title: "ニュース", 
    emoji: "📰", 
    desc: "最新の制度・条例情報と解説記事。性の多様性を尊重する社会へ", 
    slug: "news",
    seoKeywords: "LGBTQ ニュース,制度,条例,性の多様性"
  },
  food: { 
    title: "食レポ", 
    emoji: "🍽️", 
    desc: "単品メニュー・市販品のレビュー。自分の好きを発信", 
    slug: "food",
    seoKeywords: "食レポ,レビュー,発信"
  },
  beauty: { 
    title: "美容", 
    emoji: "💄", 
    desc: "コスメ・スキンケアのレビュー。自分らしい美しさを追求", 
    slug: "beauty",
    seoKeywords: "美容,コスメ,自分らしく"
  },
  funding: { 
    title: "寄付金を募る", 
    emoji: "🤝", 
    desc: "LGBTQ+コミュニティの仲間を支援するページ。プロジェクトを立ち上げ、お互いに支援し合いましょう", 
    slug: "funding",
    seoKeywords: "LGBTQ 寄付,支援,クラウドファンディング,コミュニティ"
  },
};

const sortOptions = [
  { value: "newest", label: "新着順" },
  { value: "popular", label: "人気順" },
  { value: "comments", label: "コメント多い順" },
  { value: "points", label: "ポイント高い順" },
];

const timeRangeOptions = [
  { value: "all", label: "全期間" },
  { value: "24h", label: "直近24時間" },
  { value: "7d", label: "直近7日" },
  { value: "30d", label: "直近30日" },
];

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getCategoryPlaceholder = (category: string | undefined): string => {
  const categoryMap: { [key: string]: string } = {
    'board': '/assets/placeholders/board.svg',
    'art': '/assets/placeholders/art.svg',
    'music': '/assets/placeholders/music.svg',
    'shops': '/assets/placeholders/shops.svg',
    'tourism': '/assets/placeholders/tourism.svg',
    'comics': '/assets/placeholders/comics.svg',
  };
  return categoryMap[category || 'board'] || '/assets/placeholders/board.svg';
};

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '今';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}日前`;
  return date.toLocaleDateString('ja-JP');
};

const CategoryPage: React.FC = () => {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user, isAnonymous } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [timeRange, setTimeRange] = useState(searchParams.get('range') || 'all');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const category = categoryKey ? categories[categoryKey as keyof typeof categories] : null;

  const subcategories: Record<string, string[]> = {
    board: ['悩み相談（カミングアウト／学校生活／職場環境）', '求人募集', '法律・手続き関係', '講座・勉強会', 'その他'],
    music: ['ジャズ', 'Jポップ', 'ポップス', 'R&B', 'ロック', 'AOR', 'クラシック', 'Hip-Hop', 'ラップ', 'ファンク', 'レゲエ', 'ワールド・ミュージック', 'AI生成音楽', 'その他'],
    shops: ['アパレル・ブティック', '雑貨店', 'レストラン・バー', '美容室・メイク', 'その他'],
    tourism: [],
    comics: ['映画', 'コミック', 'TVドラマ', '同人誌', 'その他'],
    art: []
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: categoryKey || '',
        sort: sortBy,
        range: timeRange,
        limit: '20'
      });
      
      if (selectedTag) {
        params.set('tag', selectedTag);
      }
      
      if (selectedSubcategory) {
        params.set('subcategory', selectedSubcategory);
      }
      
      const response = await fetch(`${API_URL}/api/posts/?${params}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      
      if (response.ok) {
        const postsData = await response.json();
        // バックエンドが返す media_url / media_urls をそのまま利用する
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newSort?: string, newRange?: string, newTag?: string) => {
    const params = new URLSearchParams(searchParams);
    if (newSort !== undefined) {
      params.set('sort', newSort);
      setSortBy(newSort);
    }
    if (newRange !== undefined) {
      params.set('range', newRange);
      setTimeRange(newRange);
    }
    if (newTag !== undefined) {
      if (newTag) {
        params.set('tag', newTag);
      } else {
        params.delete('tag');
      }
      setSelectedTag(newTag);
    }
    setSearchParams(params);
  };

  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowNewPostForm(false);
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
    setSelectedPost(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryKey, token, sortBy, timeRange, selectedTag, selectedSubcategory]);


  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">カテゴリーが見つかりません</h1>
          <Button onClick={() => navigate('/feed')} className="mt-4">
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">投稿を読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/feed')}
            className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{category.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold text-pink-800">{category.title}</h1>
              <p className="text-slate-600">{category.desc}</p>
              <p className="text-sm text-slate-500">{posts.length}件の投稿</p>
            </div>
          </div>
        </div>

        {/* 新規投稿ボタン */}
        <div className="flex gap-2">
          {user && !isAnonymous ? (
            <Button 
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規投稿
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
            >
              投稿するにはプレミアム登録
            </Button>
          )}
        </div>
      </div>

      {/* 並び替え・フィルタ */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-pink-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={(value) => updateFilters(value, undefined, undefined)}>
              <SelectTrigger className="w-[140px] border-pink-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={(value) => updateFilters(undefined, value, undefined)}>
              <SelectTrigger className="w-[120px] border-pink-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory filter dropdown */}
          {subcategories[categoryKey as keyof typeof subcategories]?.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select 
                value={selectedSubcategory || 'all'} 
                onValueChange={(value) => setSelectedSubcategory(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px] border-pink-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {subcategories[categoryKey as keyof typeof subcategories].map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* 新規投稿フォーム */}
      {showNewPostForm && (
        <NewPostForm
          categoryKey={categoryKey || ''}
          onPostCreated={handlePostCreated}
          onCancel={() => setShowNewPostForm(false)}
        />
      )}

      {/* 投稿グリッド */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-pink-100">
              <div className="aspect-[3/2] w-full h-[220px] bg-gray-200 animate-pulse rounded-t-2xl" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-12" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center p-12 border-pink-200">
          <CardContent>
            <div className="text-6xl mb-6">{category.emoji}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              まだ投稿がありません
            </h3>
            <p className="text-gray-500 mb-6">
              最初の投稿をして、コミュニティを盛り上げましょう！
            </p>
            {user && !isAnonymous && (
              <Button 
                onClick={() => setShowNewPostForm(true)}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                最初の投稿を作成
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer border-pink-100"
              onClick={() => openPostModal(post)}
              role="button"
              tabIndex={0}
              aria-label={`投稿: ${post.title || post.body.substring(0, 50)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPostModal(post);
                }
              }}
            >
              {/* 画像ギャラリー（投稿画像がなければ YouTube サムネ、なければプレースホルダーを使用） */}
              {(() => {
                // getPostImageUrlを使用してmedia_urlを優先的に取得
                const postImage = getPostImageUrl(post);
                
                // postImageがある場合はそのまま使用（S3のURLまたはUnsplashのURL）
                if (postImage) {
                  return (
                    <div className="aspect-[3/2] w-full h-[220px] overflow-hidden rounded-t-2xl bg-gray-100 flex items-center justify-center">
                      <img
                        src={postImage}
                        alt={post.title || '投稿画像'}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  );
                }
                
                // 画像がない場合はYouTubeサムネイルまたはプレースホルダー
                const ytUrl = post.youtube_url || extractYouTubeUrlFromText(post.body || '') || '';
                const ytThumb = getYouTubeThumbnail(ytUrl);
                const imageSrc = ytThumb || getCategoryPlaceholder(post.category);
                const finalSrc =
                  imageSrc.startsWith('http')
                    ? imageSrc
                    : imageSrc.startsWith('/assets/')
                      ? imageSrc
                      : `${API_URL}${imageSrc}`;
                return (
                  <div className="aspect-[3/2] w-full h-[220px] overflow-hidden rounded-t-2xl bg-gray-100 flex items-center justify-center">
                    <img
                      src={finalSrc}
                      alt={post.title || '投稿画像'}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                );
              })()}
              
              {/* コンテンツ */}
              <CardContent className="p-4">
                {post.title && (
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 text-lg">{post.title}</h3>
                )}
                <p className="text-gray-700 text-sm line-clamp-3 mb-3">{post.body}</p>
                
                {/* メタ情報 */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-medium">{post.user_display_name || 'ユーザー'}</span>
                  <span>{getRelativeTime(post.created_at)}</span>
                </div>
                
                {/* アクション */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <LikeButton
                    postId={post.id}
                    initialLiked={post.is_liked || false}
                    initialLikeCount={post.like_count || 0}
                    onLikeChange={(liked, likeCount) => {
                      setPosts(prevPosts =>
                        prevPosts.map(p =>
                          p.id === post.id
                            ? { ...p, is_liked: liked, like_count: likeCount }
                            : p
                        )
                      );
                    }}
                    token={token}
                    apiUrl={API_URL}
                    size="sm"
                    source="card"
                  />
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {formatNumber(post.comment_count || 0)}
                  </div>
                  {post.points && (
                    <div className="text-xs font-medium text-orange-600">
                      {formatNumber(post.points)}pt
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 投稿詳細モーダル */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          user={{ id: selectedPost.user_id, display_name: selectedPost.user_display_name || 'ユーザー', email: '' } as any}
          isOpen={isModalOpen}
          onClose={closePostModal}
          onUpdated={handlePostUpdated}
          onDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
};

export default CategoryPage;
