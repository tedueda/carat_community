import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, Heart, MessageCircle, Filter, SortAsc } from 'lucide-react';
import PostDetailModal from './PostDetailModal';
import NewPostForm from './NewPostForm';
import { Post } from '../types/Post';
import { Category, Subcategory } from '../types/category';
import { extractYouTubeId } from '../utils/youtube';
import { API_URL } from '../config';


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

const CategoryPageNew: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user, isAnonymous } = useAuth();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [timeRange, setTimeRange] = useState(searchParams.get('range') || 'all');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string | null>(subcategorySlug || null);
  const editPostId = searchParams.get('edit');

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) return;
      
      try {
        setCategoryLoading(true);
        const useMock = import.meta.env.VITE_USE_MOCK === 'true' || 
                        window.location.hostname.includes('github.io');
        
        if (useMock) {
          const response = await fetch(`${import.meta.env.BASE_URL}categories.json`);
          if (response.ok) {
            const categories = await response.json();
            const foundCategory = categories.find((cat: Category) => cat.slug === categorySlug);
            if (foundCategory) {
              setCategory(foundCategory);
              setSubcategories(foundCategory.subcategories || []);
            }
          }
        } else {
          const response = await fetch(`${API_URL}/api/categories/${categorySlug}`);
          
          if (response.ok) {
            const data = await response.json();
            setCategory(data);
            setSubcategories(data.subcategories || []);
          } else {
            console.error('カテゴリーの取得に失敗しました');
          }
        }
      } catch (error) {
        console.error('カテゴリー取得エラー:', error);
        try {
          const response = await fetch(`${import.meta.env.BASE_URL}categories.json`);
          if (response.ok) {
            const categories = await response.json();
            const foundCategory = categories.find((cat: Category) => cat.slug === categorySlug);
            if (foundCategory) {
              setCategory(foundCategory);
              setSubcategories(foundCategory.subcategories || []);
            }
          }
        } catch (fallbackError) {
          console.error('モックデータ取得エラー:', fallbackError);
        }
      } finally {
        setCategoryLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const useMock = import.meta.env.VITE_USE_MOCK === 'true' || 
                      window.location.hostname.includes('github.io');
      
      if (useMock) {
        const response = await fetch(`${import.meta.env.BASE_URL}mock-posts.json`);
        if (response.ok) {
          let postsData = await response.json();
          if (category?.id) {
            postsData = postsData.filter((p: any) => p.category_id === category.id);
          }
          if (selectedSubcategorySlug) {
            const subcategory = subcategories.find(sub => sub.slug === selectedSubcategorySlug);
            if (subcategory) {
              postsData = postsData.filter((p: any) => p.subcategory_id === subcategory.id);
            }
          }
          setPosts(postsData);
        }
      } else {
        const params = new URLSearchParams({
          sort: sortBy,
          range: timeRange,
          limit: '20'
        });
        
        if (category?.id) {
          params.set('category_id', category.id.toString());
        }
        
        if (selectedSubcategorySlug) {
          const subcategory = subcategories.find(sub => sub.slug === selectedSubcategorySlug);
          if (subcategory) {
            params.set('subcategory_id', subcategory.id.toString());
          }
        }
        
        if (selectedTag) {
          params.set('tag', selectedTag);
        }
        
        const response = await fetch(`${API_URL}/api/posts/?${params}`, {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
          } : {},
        });
        
        if (response.ok) {
          const postsData = await response.json();
          setPosts(postsData);
        }
      }
    } catch (error) {
      console.error('投稿取得エラー:', error);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}mock-posts.json`);
        if (response.ok) {
          let postsData = await response.json();
          if (category?.id) {
            postsData = postsData.filter((p: any) => p.category_id === category.id);
          }
          setPosts(postsData);
        }
      } catch (fallbackError) {
        console.error('モックデータ取得エラー:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchPosts();
    }
  }, [category, token, sortBy, timeRange, selectedTag, selectedSubcategorySlug]);

  // URLパラメータに編集対象の投稿IDがある場合、該当する投稿を編集モードで開く
  useEffect(() => {
    if (editPostId && posts.length > 0) {
      const postToEdit = posts.find(p => p.id === parseInt(editPostId));
      if (postToEdit) {
        setEditingPost(postToEdit);
        setShowNewPostForm(true);
        // URLパラメータから編集IDを削除
        const params = new URLSearchParams(searchParams);
        params.delete('edit');
        setSearchParams(params);
      }
    }
  }, [editPostId, posts]);

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

  if (categoryLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">カテゴリーを読み込み中...</div>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/feed')}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-800">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
              <p className="text-sm text-gray-500">{posts.length}件の投稿</p>
            </div>
          </div>
        </div>

        {/* 新規投稿ボタン */}
        <div className="flex gap-2">
          {user && !isAnonymous ? (
            <Button 
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規投稿
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900"
            >
              投稿するにはログイン
            </Button>
          )}
        </div>
      </div>

      {/* 並び替え・フィルタ */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={(value) => updateFilters(value, undefined, undefined)}>
              <SelectTrigger className="w-[140px] border-gray-200">
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
              <SelectTrigger className="w-[120px] border-gray-200">
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

          {/* サブカテゴリーフィルター */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select 
                value={selectedSubcategorySlug || 'all'} 
                onValueChange={(value) => setSelectedSubcategorySlug(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px] border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.slug}>
                      {sub.name}
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
          categoryKey={categorySlug || ''}
          onPostCreated={handlePostCreated}
          onCancel={() => {
            setShowNewPostForm(false);
            setEditingPost(null);
          }}
          editingPost={editingPost}
        />
      )}

      {/* 投稿グリッド */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-xl border-gray-200">
              <div className="aspect-[3/2] w-full h-[220px] bg-gray-200 animate-pulse rounded-t-xl" />
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
        <Card className="text-center p-12 border-gray-200">
          <CardContent>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              まだ投稿がありません
            </h3>
            <p className="text-gray-500 mb-6">
              最初の投稿をして、コミュニティを盛り上げましょう！
            </p>
            {user && !isAnonymous && (
              <Button 
                onClick={() => setShowNewPostForm(true)}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                最初の投稿を作成
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {posts.map((post) => {
            // youtube_urlフィールドがない場合、本文からYouTubeのURLを抽出
            const youtubeUrl = post.youtube_url || (post.body ? post.body.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s)<>"']+/i)?.[0] : null);
            return (
            <Card 
              key={post.id} 
              className="rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer border-gray-200"
              onClick={() => openPostModal(post)}
              role="button"
              tabIndex={0}
              aria-label={`投稿: ${post.title || post.body.substring(0, 50)}`}
            >
              {youtubeUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-black flex items-center justify-center relative">
                  <img 
                    src={`https://img.youtube.com/vi/${extractYouTubeId(youtubeUrl)}/maxresdefault.jpg`}
                    alt={post.title || 'YouTube動画'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const videoId = extractYouTubeId(youtubeUrl);
                      if (videoId) {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 line-clamp-2">
                  {post.title || post.body.substring(0, 100)}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.body}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {formatNumber(post.like_count || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {formatNumber(post.comment_count || 0)}
                    </span>
                  </div>
                  <span>{getRelativeTime(post.created_at)}</span>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* 投稿詳細モーダル */}
      {selectedPost && user && (
        <PostDetailModal
          post={selectedPost}
          user={user}
          isOpen={isModalOpen}
          onClose={closePostModal}
          onUpdated={handlePostUpdated}
          onDeleted={handlePostDeleted}
          onEditInForm={(post) => {
            setEditingPost(post);
            setShowNewPostForm(true);
          }}
        />
      )}
    </div>
  );
};

export default CategoryPageNew;
