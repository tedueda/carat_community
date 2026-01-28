import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Gem as DiamondIcon, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import UnderConstructionModal from './UnderConstructionModal';
import PostDetailModal from './PostDetailModal';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import { Post, User } from '../types/Post';
import { extractYouTubeId } from '../utils/youtube';
import HeroAudioPlayer from './HeroAudioPlayer';
import liveWeddingBanner from '../assets/images/live-wedding-banner.jpg';
import jewelryBanner from '../assets/images/jewelry-banner.jpg';


const specialMenuItems = [
  {
    id: "matching",
    title: "会員マッチング",
    description: "理想のパートナーと出会える安心のマッチングサービス",
    icon: "💕",
    link: "/matching",
    premiumOnly: false,
  },
  {
    id: "salon",
    title: "会員サロン",
    description: "会員限定の専門チャットサロン",
    icon: "💬",
    link: "/salon",
    premiumOnly: false,
  },
  {
    id: "business",
    title: "ビジネス",
    description: "フリマ・作品販売・講座・Live配信",
    icon: "💼",
    link: "/business",
    premiumOnly: false,
  },
];

const boardCategories = [
  { key: "music", title: "ミュージック", desc: "あなたの好きな楽曲、作成した楽曲を投稿して共有しましょう！", emoji: "🎵", link: "/category/music" },
  { key: "art", title: "アート・動画", desc: "イラスト・写真・映像作品を発表して、アートの世界を広げましょう！", emoji: "🎨", link: "/category/art" },
  { key: "comics", title: "サブカルチャー", desc: "映画・アニメ・ゲーム・小説などの作品レビューと感想を共有しましょう！", emoji: "🎭", link: "/category/comics" },
  { key: "food_shops", title: "食レポ・お店・ライブハウス", desc: "美味しいグルメやLGBTQフレンドリーなお店を紹介しましょう！", emoji: "🍽️", link: "/category/food", categories: ["food", "shops"] },
  { key: "tourism", title: "ツーリズム", desc: "おすすめの旅行先や観光スポットを紹介して、旅の楽しさを共有しましょう！", emoji: "📍", link: "/category/tourism" },
  { key: "board", title: "掲示板", desc: "悩み相談や雑談、日常の話題を自由に投稿しましょう！", emoji: "💬", link: "/category/board" },
];

// heroMessages are now loaded from i18n locale files

const getCategoryPlaceholder= (category: string | undefined): string => {
  const categoryMap: { [key: string]: string } = {
    'board': '/images/hero-slide-4.jpg',
    'community': '/images/hero-slide-4.jpg',
    'art': '/images/sub_cuture02.jpg',
    'music': '/images/music01.jpg',
    'shops': '/images/shop01.jpg',
    'tourism': '/images/img13.jpg',
    'comics': '/images/sub_cuture01.jpg',
  };
  return categoryMap[category || 'board'] || '/images/hero-slide-4.jpg';
};

// ニュース記事はAPIから取得

const dummyPosts: Post[] = [
  {
    id: 1,
    title: "初めての投稿です！",
    body: "こんにちは！Caratに参加しました。温かいコミュニティで素敵な出会いがありそうです。よろしくお願いします。",
    user_id: 1,
    visibility: "public",
    created_at: "2024-09-15T10:30:00Z",
    category: "board"
  },
  {
    id: 2,
    title: "おすすめのLGBTQ+楽曲",
    body: "最近聴いているアーティストの楽曲がとても心に響きます。同じような音楽が好きな方と語り合いたいです。",
    user_id: 3,
    visibility: "public",
    created_at: "2024-09-13T20:15:00Z",
    category: "music"
  },
  {
    id: 4,
    title: "新宿のLGBTQフレンドリーカフェ",
    body: "新宿二丁目にある素敵なカフェを見つけました。スタッフの方々がとても親切で、居心地の良い空間でした。",
    user_id: 4,
    visibility: "public",
    created_at: "2024-09-12T12:00:00Z",
    category: "shops"
  },
  {
    id: 5,
    title: "東京レインボープライドツアー企画",
    body: "来年のプライドイベントに向けて、みんなで一緒に参加するツアーを企画しています。興味のある方はぜひご参加ください。",
    user_id: 5,
    visibility: "public",
    created_at: "2024-09-11T18:30:00Z",
    category: "tourism"
  },
  {
    id: 6,
    title: "「君の名は。」のLGBTQ+解釈について",
    body: "新海誠監督の作品にはジェンダーアイデンティティのテーマが含まれていると思います。皆さんはどう思われますか？",
    user_id: 6,
    visibility: "public",
    created_at: "2024-09-10T14:20:00Z",
    category: "comics"
  }
];

const dummyUsers: { [key: number]: User } = {
  1: { id: 1, display_name: "さくら", email: "sakura@example.com" },
  2: { id: 2, display_name: "アート太郎", email: "art@example.com" },
  3: { id: 3, display_name: "音楽好き", email: "music@example.com" },
  4: { id: 4, display_name: "カフェ探検家", email: "cafe@example.com" },
  5: { id: 5, display_name: "ツアーガイド", email: "tour@example.com" },
  6: { id: 6, display_name: "映画評論家", email: "movie@example.com" }
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categoryPosts, setCategoryPosts] = useState<{ [key: string]: Post[] }>({});
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [, setUsers] = useState<{ [key: number]: User }>(dummyUsers);
  const [loading, setLoading] = useState(false);
  const [showConstructionModal, setShowConstructionModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isHeroVisible] = useState(true);
  const heroSectionRef = useRef<HTMLElement>(null);
  const { token, user, isAnonymous } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


  const fetchNews = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
      });
      console.log(`Fetching news from: ${API_URL}/api/posts/?${params}`);
      const response = await fetch(`${API_URL}/api/posts/?${params}`);
      console.log('News Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        const newsData = data.filter((post: any) => post.category === 'news');
        console.log('📰 [HomePage] News articles filtered:', newsData.length, newsData);
        setNewsArticles(newsData.slice(0, 4));  // 最新4件
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const fetchCategoryPosts = async (lang?: string) => {
    try {
      const headers: any = {};
      if (token && !isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const targetLang = lang || currentLanguage;
      
      // 並列処理で全カテゴリのデータを同時取得（翻訳エンドポイント使用）
      const categoryPromises = boardCategories.map(async (cat) => {
        if (cat.categories) {
          // 複数カテゴリを統合（食レポ・お店）
          const subCatPromises = cat.categories.map(subCat =>
            fetch(`${API_URL}/api/translations/posts?category=${subCat}&limit=8&lang=${targetLang}`, { headers })
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
          const results = await Promise.all(subCatPromises);
          const combinedPosts = results.flat();
          // 最新順でソートして4件取得
          combinedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return { key: cat.key, posts: combinedPosts.slice(0, 4) };
        } else {
          // 単一カテゴリ（翻訳エンドポイント使用）
          const posts = await fetch(`${API_URL}/api/translations/posts?category=${cat.key}&limit=4&lang=${targetLang}`, { headers })
            .then(res => res.ok ? res.json() : [])
            .catch(() => []);
          return { key: cat.key, posts };
        }
      });
      
      const results = await Promise.all(categoryPromises);
      const allCategoryPosts: { [key: string]: Post[] } = {};
      results.forEach(result => {
        allCategoryPosts[result.key] = result.posts;
      });
      
      setCategoryPosts(allCategoryPosts);
    } catch (error) {
      console.error('Failed to fetch category posts:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const headers: any = {};
      if (token && !isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log(`Fetching posts from: ${API_URL}/api/posts?limit=20`);
      const response = await fetch(`${API_URL}/api/posts?limit=20`, {
        headers,
      });
      console.log('Response status:', response.status);

      if (response.ok) {
        const postsData = await response.json();
        
        const enhancedPosts = postsData.map((post: any) => ({
          ...post,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          is_liked: post.is_liked || false,
        }));
        
        setPosts(enhancedPosts);
        
        const userIds = [...new Set(enhancedPosts.map((post: any) => post.user_id))];
        const usersData: { [key: number]: any } = {};
        
        for (const userId of userIds) {
          try {
            const userHeaders: any = {};
            if (token && !isAnonymous) {
              userHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const userResponse = await fetch(`${API_URL}/api/users/${userId}`, {
              headers: userHeaders,
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId as number] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            usersData[userId as number] = {
              id: userId,
              display_name: `ユーザー${userId}`,
              email: `user${userId}@example.com`
            };
          }
        }
        
        setUsers(usersData);
        
        // 投稿にユーザー表示名を追加
        const postsWithUserNames = enhancedPosts.map((post: any) => ({
          ...post,
          user_display_name: usersData[post.user_id]?.display_name || 'テッドさん'
        }));
        setPosts(postsWithUserNames);
      } else {
        console.error('Failed to fetch posts from API, using fallback data');
        setPosts(dummyPosts);
        setUsers(dummyUsers);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts(dummyPosts);
      setUsers(dummyUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchNews();
    fetchCategoryPosts(currentLanguage);
  }, [user, isAnonymous]);

  // Re-fetch category posts when language changes
  useEffect(() => {
    fetchCategoryPosts(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 8);
    }, 8000);

    return () => clearInterval(slideInterval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">{t('homepage.loadingContent')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{
      background: `
        radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(240, 248, 255, 0.6) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(248, 250, 252, 0.7) 0%, transparent 50%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 50%, rgba(241, 245, 249, 0.9) 100%)
      `
    }}>
      <div className="w-full max-w-full space-y-8">
        
        {/* ヒーローセクション */}
        <section ref={heroSectionRef} className="relative w-full overflow-hidden" style={{height: '860px'}}>
          <div className="absolute inset-0">
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/img10.jpg" 
                alt="LGBTQ+ Community 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/img12.jpg" 
                alt="LGBTQ+ Community 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/img14.jpg" 
                alt="LGBTQ+ Community 3"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 3 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/hero1.png" 
                alt="LGBTQ+ Community 4"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 4 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/hero2.png" 
                alt="LGBTQ+ Community 5"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 5 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/hero3.png" 
                alt="LGBTQ+ Community 6"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 6 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/hero4.png" 
                alt="LGBTQ+ Community 7"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className={`absolute inset-0 transition-opacity duration-3000 ${currentSlide === 7 ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src="/images/hero5.png" 
                alt="LGBTQ+ Community 8"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          {/* Sound Credit and Audio Player */}
          <div className="absolute bottom-16 right-8 z-50 flex flex-col items-end gap-2 pointer-events-auto">
            <div className="text-white text-sm opacity-70 flex items-center gap-2">
              <span className="text-lg">♫</span>
              <span>Inspired by Marvin Gaye</span>
            </div>
            <HeroAudioPlayer isHeroVisible={isHeroVisible} />
          </div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white px-4 max-w-6xl">
              <h2 className="text-3xl md:text-7xl font-serif font-bold leading-tight mb-6 transition-opacity duration-1000">
                {t(`hero.messages.${currentSlide}.main`).split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < t(`hero.messages.${currentSlide}.main`).split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-lg md:text-2xl mb-8 opacity-90 transition-opacity duration-1000">
                {t(`hero.messages.${currentSlide}.sub`).split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < t(`hero.messages.${currentSlide}.sub`).split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </section>

        {/* ヒーロー直下のCTAセクション */}
        <section className="relative -mt-12 z-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white/95 border border-gray-200 shadow-xl rounded-2xl px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-sm md:text-base text-slate-500 mb-1">会員制LGBTQ+コミュニティ "Carat"</p>
                <p className="text-lg md:text-xl font-serif text-slate-900">投稿とマッチングで、あなたの物語をはじめましょう。</p>
                {(!user || isAnonymous) && (
                  <p className="mt-2 text-sm md:text-base text-slate-500">
                    * 無料会員はサイト全体の内容を見ていただけます。投稿や有料会員限定サイトを閲覧するには会員登録が必要です。
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
                {user && !isAnonymous ? (
                  <Button 
                    onClick={() => navigate('/create/board')}
                    className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-black px-6 py-3 text-base md:text-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    投稿を作成
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.location.href = '/login'}
                    className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-black px-6 py-3 text-base md:text-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    会員登録（月1,000円）
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 掲示板セクション - 6カテゴリ */}
        {boardCategories.map((cat) => (
          <section key={cat.key} className="py-8">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2 gap-1 md:gap-0">
              <div className="flex-1">
                <h3 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  {t(`homepage.categories.${cat.key}.title`)}
                </h3>
                <p className="text-sm md:text-base text-slate-600 mt-1">{t(`homepage.categories.${cat.key}.desc`)}</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-black hover:bg-gray-100 font-medium text-base md:text-xl self-start md:self-auto"
                onClick={() => navigate(cat.link)}
              >
                {t('homepage.viewAll')}→
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(categoryPosts[cat.key] || []).slice(0, 4).map((post) => {
                // youtube_urlフィールドがない場合、本文からYouTubeのURLを抽出
                const youtubeUrl = post.youtube_url || (post.body ? post.body.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s)<>"']+/i)?.[0] : null);
                console.log(`📌 Post ${post.id} - youtube_url:`, post.youtube_url, 'extracted:', youtubeUrl, 'media_url:', post.media_url);
                return (
                <Card 
                  key={post.id} 
                  onClick={() => {
                    setSelectedPost(post);
                    setSelectedUser({
                      id: post.user_id,
                      display_name: post.user_display_name || 'ユーザー',
                      email: ''
                    });
                  }}
                  className="group backdrop-blur-md bg-gray-50/80 border border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-lg hover:shadow-2xl"
                >
                  {youtubeUrl ? (
                    <div className="h-40 overflow-hidden rounded-t-lg bg-black flex items-center justify-center relative">
                      <img 
                        src={`https://img.youtube.com/vi/${extractYouTubeId(youtubeUrl)}/maxresdefault.jpg`}
                        alt={post.title || 'YouTube動画'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const videoId = extractYouTubeId(youtubeUrl);
                          if (videoId) {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          } else {
                            (e.target as HTMLImageElement).src = getCategoryPlaceholder(post.category);
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
                  ) : (post.media_url || (post.media_urls && post.media_urls.length > 0)) ? (
                    <div className="h-40 overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                      <img 
                        src={`${(() => {
                          const imageUrl = post.media_url || (post.media_urls && post.media_urls[0]);
                          if (!imageUrl) return getCategoryPlaceholder(post.category);
                          return imageUrl.startsWith('http') ? imageUrl : 
                                 (imageUrl.startsWith('/assets/') || imageUrl.startsWith('/images/')) ? imageUrl : 
                                 `${API_URL}${imageUrl}`;
                        })()}`}
                        alt={post.title || '投稿画像'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCategoryPlaceholder(post.category);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-40 overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                      <img 
                        src={getCategoryPlaceholder(post.category)}
                        alt={cat.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="text-slate-500">
                        {new Date(post.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {(post.display_title || post.title) && (
                      <h4 className="font-serif font-semibold leading-snug text-slate-900 mb-2 group-hover:gold-accent line-clamp-2">
                        {post.display_title || post.title}
                      </h4>
                    )}
                    <p className="text-sm text-slate-600 line-clamp-2">{post.display_text || post.body}</p>
                    <div className="flex items-center justify-between text-sm mt-3">
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="flex items-center gap-1">
                          <DiamondIcon className="h-3 w-3 text-blue-500" />
                          {post.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comment_count || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
              {(!categoryPosts[cat.key] || categoryPosts[cat.key].length === 0) && (
                <div className="col-span-4 text-center py-8 text-slate-500">
                  投稿がまだありません
                </div>
              )}
            </div>
          </section>
        ))}

        {/* 特別メニュー - カテゴリ一覧の直下 */}
        <section className="py-12">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-6 gap-1 md:gap-0">
            <h3 className="text-4xl md:text-5xl font-serif font-semibold text-slate-900">特別メニュー</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {specialMenuItems.map((item) => {
              // 有料会員かどうか
              const isPaidUser = user?.membership_type === 'premium' || user?.membership_type === 'admin';
              const isLocked = item.premiumOnly && !isPaidUser;
              
              const handleMenuClick = () => {
                if (isLocked) {
                  setUpgradeFeatureName(item.title);
                  setShowUpgradeModal(true);
                } else {
                  navigate(item.link);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              };
              
              return (
                <Card 
                  key={item.id} 
                  className={`group backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-lg ${
                    isLocked 
                      ? 'bg-gray-100/90 border-gray-300 hover:bg-gray-200/90' 
                      : 'bg-gray-50/90 border-gray-200 hover:bg-white hover:border-gray-300 hover:scale-[1.02] hover:shadow-2xl'
                  }`}
                  onClick={handleMenuClick}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`text-5xl mb-4 transition-transform relative ${isLocked ? 'opacity-50' : 'group-hover:scale-110'}`}>
                        {item.icon}
                        {isLocked && (
                          <div className="absolute -top-1 -right-1 bg-gray-600 rounded-full p-1">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <h4 className={`font-serif font-semibold text-xl mb-2 flex items-center gap-2 ${isLocked ? 'text-slate-500' : 'text-slate-900 group-hover:gold-accent'}`}>
                        {item.title}
                        {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                      </h4>
                      <p className={`text-sm mb-4 ${isLocked ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.description}
                      </p>
                      <Button 
                        className={`font-medium w-full ${
                          isLocked 
                            ? 'bg-gray-200 text-gray-500 border border-gray-300 hover:bg-gray-300' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-black group-hover:shadow-md'
                        } transition-all`}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick();
                        }}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            有料会員限定
                          </>
                        ) : (
                          <>
                            詳細を見る
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ライブウェディングバナー */}
        <section className="py-6">
          <div className="relative rounded-xl shadow-2xl overflow-hidden" style={{ maxHeight: '400px' }}>
            <img 
              src={liveWeddingBanner} 
              alt="Live Wedding"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 md:px-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Live Wedding
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl">
                オンラインで叶える、あなただけの特別な結婚式
              </p>
              <button
                onClick={() => {
                  navigate('/live-wedding');
                  window.scrollTo(0, 0);
                }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                詳細はこちら
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ジュエリー販売バナー */}
        <section className="py-6">
          <div className="relative rounded-xl shadow-2xl overflow-hidden" style={{ maxHeight: '400px' }}>
            <img 
              src={jewelryBanner} 
              alt="Jewelry Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8 md:px-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                ジュエリー販売
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl">
                会員限定で特別な価格にてご提供
              </p>
              <button
                onClick={() => navigate('/jewelry')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                詳細はこちら
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ニュースセクション */}
        <section className="py-12">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-6 gap-1 md:gap-0">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">{t('news.title')}</h3>
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-black hover:bg-gray-100 font-medium text-base self-start md:self-auto"
              onClick={() => navigate('/news')}
            >
              {t('news.viewAll')}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newsArticles.slice(0, 4).map((article) => (
              <Card 
                key={article.id} 
                className="group bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedNewsArticle(article)}
              >
                {(article.media_url || (article.media_urls && article.media_urls.length > 0)) ? (
                  <div className="h-[200px] overflow-hidden bg-gray-50">
                    <img
                      src={`${(() => {
                        const imageUrl = article.media_url || (article.media_urls && article.media_urls[0]);
                        if (!imageUrl) return '';
                        return imageUrl.startsWith('http') ? imageUrl : 
                               (imageUrl.startsWith('/assets/') || imageUrl.startsWith('/images/')) ? imageUrl : 
                               `${API_URL}${imageUrl}`;
                      })()}`}
                      alt={article.title || 'ニュース画像'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <span className="text-6xl opacity-30">📰</span>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-gray-800 text-white px-2.5 py-1 rounded font-medium">
                      news
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 line-clamp-2 text-lg leading-snug group-hover:text-gray-700 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {article.body}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-gray-100">
                    <span>{new Date(article.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}</span>
                    <span className="text-gray-700 hover:text-black font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t('post.readMore')}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 参加CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white/95 border border-gray-200 shadow-xl rounded-2xl px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-sm md:text-base text-slate-500 mb-1">{t('cta.communityTitle')}</p>
                <p className="text-lg md:text-xl font-serif text-slate-900">{t('cta.communitySubtitle')}</p>
                <p className="mt-2 text-sm md:text-base text-slate-500">
                  {t('cta.freeUserNote')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-black px-6 py-3 text-base md:text-lg font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {t('membership.registerMonthly')}
                </Button>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
      
      <UnderConstructionModal 
        isOpen={showConstructionModal}
        onClose={() => setShowConstructionModal(false)}
      />

      {/* プレミアムアップグレードモーダル */}
      <PremiumUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={upgradeFeatureName}
      />

      {/* ニュース詳細モーダル */}
      {selectedNewsArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNewsArticle(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNewsArticle.title}</h2>
              <button
                onClick={() => setSelectedNewsArticle(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="閉じる"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedNewsArticle.media_url && (
                <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center max-h-96">
                  <img
                    src={`${selectedNewsArticle.media_url.startsWith('/images/')
                      ? ''
                      : (selectedNewsArticle.media_url.startsWith('http') ? '' : API_URL)
                    }${selectedNewsArticle.media_url}`}
                    alt={selectedNewsArticle.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                  {selectedNewsArticle.category || 'ニュース'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedNewsArticle.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNewsArticle.body}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  投稿者: {selectedNewsArticle.user_display_name || 'ユーザー'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ログインポップアップ */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-semibold text-slate-900 mb-4">ログインが必要です</h3>
            <p className="text-slate-600 mb-6">
              この機能を利用するには、会員としてログインする必要があります。
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/login');
                }}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                ログイン
              </Button>
              <Button 
                onClick={() => setShowLoginPrompt(false)}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PostDetailModal */}
      {selectedPost && selectedUser && (
        <PostDetailModal
          post={selectedPost}
          user={selectedUser}
          isOpen={true}
          onClose={() => {
            setSelectedPost(null);
            setSelectedUser(null);
          }}
          onUpdated={(updatedPost: Post) => {
            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
            setSelectedPost(updatedPost);
          }}
          onDeleted={(postId: number) => {
            setPosts(posts.filter(p => p.id !== postId));
            setSelectedPost(null);
            setSelectedUser(null);
          }}
          onEditInForm={(post) => {
            // カテゴリページに遷移して編集モードで開く
            const category = post.category || 'board';
            navigate(`/category/${category}?edit=${post.id}`);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
