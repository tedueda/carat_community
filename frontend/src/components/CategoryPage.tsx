import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, MessageCircle, Filter, SortAsc, Globe } from 'lucide-react';
import LikeButton from './common/LikeButton';
import { Post } from '../types/Post';
import { getYouTubeThumbnail, extractYouTubeUrlFromText } from '../utils/youtube';
import { getPostImageUrl } from '../utils/imageUtils';
import { API_URL } from '../config';


const categoryKeys = ['board', 'art', 'music', 'shops', 'tourism', 'comics', 'news', 'food', 'beauty', 'funding'] as const;
type CategoryKey = typeof categoryKeys[number];

const categoryEmojis: Record<CategoryKey, string> = {
  board: "💬",
  art: "🎨",
  music: "🎵",
  shops: "🏬",
  tourism: "📍",
  comics: "🎬",
  news: "📰",
  food: "🍽️",
  beauty: "💄",
  funding: "🤝",
};

const sortOptionKeys = ['newest', 'popular', 'comments', 'points'] as const;
const timeRangeOptionKeys = ['all', '24h', '7d', '30d'] as const;

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
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user, isFreeUser } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [timeRange, setTimeRange] = useState(searchParams.get('range') || 'all');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const editPostId = searchParams.get('edit');

  const isValidCategory = categoryKey && categoryKeys.includes(categoryKey as CategoryKey);
  const categoryEmoji = isValidCategory ? categoryEmojis[categoryKey as CategoryKey] : null;
  const categoryTitle = isValidCategory ? t(`categoryPage.categories.${categoryKey}.title`) : '';
  const categoryDesc = isValidCategory ? t(`categoryPage.categories.${categoryKey}.desc`) : '';

  const subcategories: Record<string, string[]> = {
    board: ['悩み相談（カミングアウト／学校生活／職場環境）', '求人募集', '法律・手続き関係', '講座・勉強会', 'その他'],
    music: ['ジャズ', 'Jポップ', 'ポップス', 'R&B', 'ロック', 'AOR', 'クラシック', 'Hip-Hop', 'ラップ', 'ファンク', 'レゲエ', 'ワールド・ミュージック', 'AI生成音楽', 'その他'],
    shops: ['アパレル・ブティック', '雑貨店', 'レストラン・バー', '美容室・メイク', 'その他'],
    food: ['料理・食品', '飲食店', 'ブティック', '雑貨店', 'バー', 'サロン', 'ライブハウス'],
    tourism: [],
    comics: ['映画', 'コミック', 'TVドラマ', '同人誌', 'その他'],
    art: []
  };

  const fetchPosts = async (lang?: string) => {
    try {
      setLoading(true);
      const targetLang = lang || currentLanguage;
      
      // Use translation endpoint to get posts with translations
      const params = new URLSearchParams({
        category: categoryKey || '',
        limit: '20',
        lang: targetLang
      });
      
      if (selectedTag) {
        params.set('tag', selectedTag);
      }
      
      if (selectedSubcategory) {
        params.set('subcategory', selectedSubcategory);
      }
      
      const response = await fetch(`${API_URL}/api/translations/posts?${params}`, {
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

  useEffect(() => {
    fetchPosts(currentLanguage);
  }, [categoryKey, token, sortBy, timeRange, selectedTag, selectedSubcategory]);

  // Re-fetch when language changes
  useEffect(() => {
    if (!loading) {
      fetchPosts(currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (editPostId) {
      const params = new URLSearchParams(searchParams);
      params.delete('edit');
      setSearchParams(params);
    }
  }, [editPostId]);


  if (!isValidCategory) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">{t('categoryPage.categoryNotFound')}</h1>
          <Button onClick={() => navigate('/feed')} className="mt-4">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">{t('post.loadingPosts')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-3">
        {/* Mobile */}
        <div className="sm:hidden grid grid-cols-2 gap-x-4 gap-y-2 items-start">
          <div className="col-span-1">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/feed')}
              className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.backToHome')}
            </Button>
          </div>
          <div className="col-span-1 flex justify-end">
            {user && !isFreeUser ? (
              <Button 
                onClick={() => navigate(`/create/${categoryKey || ''}`)}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('categoryPage.newPost')}
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                {t('common.registerToPaidMember')}
              </Button>
            )}
          </div>
          <div className="col-span-1 flex items-center gap-2 min-w-0">
            <div className="text-2xl shrink-0">{categoryEmoji}</div>
            <h1 className="text-xl font-bold text-pink-800 truncate">{categoryTitle}</h1>
          </div>
          <div className="col-span-1 min-w-0">
            <p className="text-slate-600 text-sm leading-snug line-clamp-2">{categoryDesc}</p>
            <p className="text-xs text-slate-500">{t('categoryPage.postsCount', { count: posts.length })}</p>
          </div>
        </div>

        {/* Desktop / Tablet */}
        <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/feed')}
              className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.backToHome')}
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{categoryEmoji}</div>
              <div>
                <h1 className="text-2xl font-bold text-pink-800">{categoryTitle}</h1>
                <p className="text-slate-600">{categoryDesc}</p>
                <p className="text-sm text-slate-500">{t('categoryPage.postsCount', { count: posts.length })}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {user && !isFreeUser ? (
              <Button 
                onClick={() => navigate(`/create/${categoryKey || ''}`)}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('categoryPage.newPost')}
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                {t('common.registerToPaidMember')}
              </Button>
            )}
          </div>
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
                {sortOptionKeys.map(key => (
                  <SelectItem key={key} value={key}>
                    {t(`categoryPage.sort.${key}`)}
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
                {timeRangeOptionKeys.map(key => (
                  <SelectItem key={key} value={key}>
                    {t(`categoryPage.timeRange.${key}`)}
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
                  <SelectItem value="all">{t('categoryPage.all')}</SelectItem>
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
            <div className="text-6xl mb-6">{categoryEmoji}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              {t('post.noPostsYet')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('categoryPage.noPostsMessage')}
            </p>
            {user && !isFreeUser && (
              <Button 
                onClick={() => navigate(`/create/${categoryKey || ''}`)}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('common.createFirstPost')}
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
              onClick={() => navigate(`/posts/${post.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`投稿: ${post.title || post.body.substring(0, 50)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/posts/${post.id}`);
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
                {(post.display_title || post.title) && (
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 text-lg">{post.display_title || post.title}</h3>
                )}
                <p className="text-gray-700 text-sm line-clamp-3 mb-3">{post.display_text || post.body}</p>
                {post.is_translated && (
                  <div className="flex items-center gap-1 text-xs text-blue-500 mb-2">
                    <Globe className="h-3 w-3" />
                    <span>{t('translation.autoTranslated')}</span>
                  </div>
                )}
                
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

    </div>
  );
};

export default CategoryPage;
