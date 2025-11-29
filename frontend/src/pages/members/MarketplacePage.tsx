import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, ShoppingBag, Plus, Grid, List, MapPin, Clock, Star, Shield, Upload, Minus, Trash2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  category: string;
  location: string;
  seller_name: string;
  seller_id: number;
  images: string[];
  created_at: string;
  status: 'active' | 'sold' | 'completed';
  is_favorited: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com';

const MarketplacePage: React.FC = () => {
  console.log('=== MarketplacePage component loaded successfully ===');
  const navigate = useNavigate();
  useAuth();
  const token = localStorage.getItem('token');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // const [sortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showListingDetail, setShowListingDetail] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editListing, setEditListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    newImages: [] as File[]
  });
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good' as const,
    category: 'ファッション',
    location: '',
    images: [] as File[]
  });

  const [listings, setListings] = useState<Listing[]>([]);

  // 出品データを取得
  const fetchListings = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/api/posts/?category=marketplace&limit=50`, { headers });
      if (response.ok) {
        const data = await response.json();
        const items = data.map((post: any) => ({
          id: post.id,
          title: post.title || '',
          description: post.body || '',
          price: post.goal_amount || 0,
          condition: post.subcategory?.includes('new') ? 'new' : post.subcategory?.includes('like_new') ? 'like_new' : post.subcategory?.includes('fair') ? 'fair' : 'good',
          category: post.subcategory || 'その他',
          location: post.excerpt || '',
          seller_name: post.user_display_name || '匿名',
          seller_id: post.user_id,
          images: post.media_urls || [],
          created_at: post.created_at,
          status: 'active' as const,
          is_favorited: false
        }));
        setListings(items);
      }
    } catch (error) {
      console.error('出品データ取得エラー:', error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'fashion', label: 'ファッション' },
    { key: 'books', label: '本・雑誌' },
    { key: 'goods', label: 'グッズ' },
    { key: 'accessories', label: 'アクセサリー' },
    { key: 'home', label: 'インテリア' },
    { key: 'other', label: 'その他' }
  ];

  const conditionLabels: { [key: string]: string } = {
    new: '新品',
    like_new: '未使用に近い',
    good: '目立った傷や汚れなし',
    fair: 'やや傷や汚れあり'
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    return `${diffDays}日前`;
  };

  const handleChatContact = (listing: Listing) => {
    console.log('チャットで連絡:', listing.title);
    // 出品名を含むメッセージを準備
    const initialMessage = `「${listing.title}」の件です。`;
    // マッチングチャットに遷移（context="marketplace", context_id=listing_id, 初期メッセージ付き）
    navigate(`/matching/chats?context=marketplace&context_id=${listing.id}&seller_id=${listing.seller_id}&initial_message=${encodeURIComponent(initialMessage)}`);
  };

  const handleFavorite = (listingId: number) => {
    console.log('お気に入り:', listingId);
    // TODO: お気に入り機能実装
  };

  const handleShowDetail = (listing: Listing) => {
    console.log('詳細表示:', listing.title);
    setSelectedListing(listing);
    setShowListingDetail(true);
  };

  // 出品取り下げ
  const handleWithdrawListing = (listing: Listing) => {
    console.log('出品取り下げ:', listing.title);
    setSelectedListing(listing);
    setShowWithdrawModal(true);
  };

  // 取り下げ確定
  const confirmWithdraw = async () => {
    if (selectedListing) {
      try {
        const response = await fetch(`${API_URL}/api/posts/${selectedListing.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          alert(`「${selectedListing.title}」を取り下げました。`);
          setListings(prev => prev.filter(l => l.id !== selectedListing.id));
          setShowWithdrawModal(false);
          setShowListingDetail(false);
        } else {
          alert('取り下げに失敗しました');
        }
      } catch (error) {
        console.error('取り下げエラー:', error);
        alert('取り下げに失敗しました');
      }
    }
  };

  // 評価送信
  const submitReview = (rating: 'good' | 'neutral' | 'bad', comment: string) => {
    if (selectedListing) {
      console.log('評価送信:', { listing: selectedListing.title, rating, comment });
      alert(`「${selectedListing.title}」の評価を送信しました。`);
      // TODO: API呼び出しで評価データ送信
      setShowReviewModal(false);
      setShowListingDetail(false);
    }
  };

  // 出品フォーム送信
  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newListing.title || !newListing.description || !newListing.price || !newListing.location) {
      alert('すべての必須項目を入力してください。');
      return;
    }

    if (newListing.images.length === 0) {
      alert('商品画像を最低1枚アップロードしてください。');
      return;
    }

    try {
      // 画像アップロード
      const mediaIds: number[] = [];
      for (const file of newListing.images) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          mediaIds.push(uploadResult.id);
        }
      }

      // 出品作成
      const response = await fetch(`${API_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newListing.title,
          body: newListing.description,
          category: 'marketplace',
          subcategory: newListing.category,
          visibility: 'public',
          media_ids: mediaIds,
          goal_amount: parseInt(newListing.price) || 0,
          excerpt: newListing.location
        })
      });

      if (response.ok) {
        alert(`商品「${newListing.title}」を出品しました！`);
        setNewListing({
          title: '',
          description: '',
          price: '',
          condition: 'good',
          category: 'ファッション',
          location: '',
          images: []
        });
        setShowCreateListing(false);
        fetchListings();
      } else {
        alert('出品に失敗しました');
      }
    } catch (error) {
      console.error('出品エラー:', error);
      alert('出品に失敗しました');
    }
  };

  // フォーム入力変更
  const handleListingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewListing(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 画像アップロード
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewListing(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 5) // 最大5枚
      }));
    }
  };

  // 画像削除
  const removeImage = (index: number) => {
    setNewListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    const isActive = listing.status === 'active';
    return matchesSearch && matchesCategory && isActive;
  });

  return (
    <div className="min-h-screen bg-carat-gray1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-carat-white py-20">
        <div className="absolute inset-0 bg-carat-gray1/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ホームに戻るボタン */}
          <div className="mb-6">
            <button
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-carat-gray6 hover:text-carat-black transition-colors"
            >
              <Home className="h-5 w-5" />
              ホームに戻る
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-carat-black mb-6">
              マーケット
            </h1>
            <p className="text-xl md:text-2xl text-carat-gray5 mb-8 max-w-4xl mx-auto leading-relaxed">
              会員同士で安心・安全な売買取引
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-lg text-carat-gray5 mb-8">
            <div className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-carat-black" />
              <span>会員限定</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-carat-black" />
              <span>チャットで安心取引</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-carat-black" />
              <span>{listings.length}件の出品</span>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateListing(true)}
              className="bg-carat-black text-carat-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-carat-gray6 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              出品する
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-carat-white border-b border-carat-gray2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carat-gray4 w-5 h-5" />
              <input
                type="text"
                placeholder="商品を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black/20 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-carat-black text-carat-white'
                      : 'bg-carat-gray2 text-carat-gray6 hover:bg-carat-gray3'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-carat-gray3 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-carat-black text-carat-white' : 'bg-carat-white text-carat-gray5 hover:bg-carat-gray1 hover:text-carat-black'
                  }`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-carat-black text-carat-white' : 'bg-carat-white text-carat-gray5 hover:bg-carat-gray1 hover:text-carat-black'
                  }`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-carat-white rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-carat-gray2">
                {/* Listing Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'} bg-carat-gray2`}>
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-carat-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-carat-gray6">
                    {conditionLabels[listing.condition]}
                  </div>
                  <button
                    onClick={() => handleFavorite(listing.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                      listing.is_favorited ? 'bg-carat-black text-carat-white' : 'bg-carat-white/90 text-carat-gray5 hover:bg-carat-gray1 hover:text-carat-black'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${listing.is_favorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Listing Info */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-carat-black mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-2xl font-bold text-carat-black mb-2">¥{listing.price.toLocaleString()}</p>
                  </div>

                  <p className="text-carat-gray6 mb-4 text-sm line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Listing Meta */}
                  <div className="flex items-center justify-between mb-4 text-sm text-carat-gray5">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{getTimeAgo(listing.created_at)}</span>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-carat-black rounded-full flex items-center justify-center text-carat-white text-sm font-bold">
                        {listing.seller_name.charAt(0)}
                      </div>
                      <span className="ml-2 text-sm text-carat-gray5">{listing.seller_name}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleChatContact(listing)}
                      className="flex-1 bg-carat-black text-carat-white py-2 px-3 rounded-lg font-medium hover:bg-carat-gray6 transition-all duration-300 flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      チャットで連絡
                    </button>
                    <button
                      onClick={() => handleShowDetail(listing)}
                      className="px-4 py-3 border border-carat-gray3 text-carat-gray6 rounded-lg hover:bg-carat-gray1 transition-colors"
                    >
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-carat-gray2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-carat-gray4" />
              </div>
              <h3 className="text-lg font-semibold text-carat-black mb-2">商品が見つかりません</h3>
              <p className="text-carat-gray5">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="py-16 bg-carat-gray1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-carat-black mb-6">
            安心・安全な取引のために
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-carat-black rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-carat-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">チャットで連絡</h3>
              <p className="text-carat-gray6">すべての連絡は専用チャットで行い、個人情報を守ります。</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-carat-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-carat-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">会員限定</h3>
              <p className="text-carat-gray6">会員同士の取引で安心感を提供します。</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-carat-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-carat-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">評価システム</h3>
              <p className="text-carat-gray6">取引完了後の評価で信頼できる取引相手を見つけられます。</p>
            </div>
          </div>
          <button className="bg-carat-black text-carat-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-carat-gray6 transition-all duration-300">
            安全ガイドラインを見る
          </button>
        </div>
      </section>

      {/* Create Listing Modal */}
      {showCreateListing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowCreateListing(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-carat-black mb-6">商品を出品</h3>

            <form onSubmit={handleSubmitListing} className="space-y-6">
              {/* 商品画像 */}
              <div>
                <label className="block text-sm font-medium text-carat-gray6 mb-2">
                  商品画像 * (最大5枚)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {newListing.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`商品画像 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-carat-black text-carat-white rounded-full p-1 hover:bg-carat-gray6"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {newListing.images.length < 5 && (
                    <div className="border-2 border-dashed border-carat-gray3 rounded-lg p-4 text-center hover:border-carat-black transition-colors relative">
                      <Upload className="mx-auto h-8 w-8 text-carat-gray4 mb-2" />
                      <p className="text-sm text-carat-gray6">画像を追加</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 商品名 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-carat-gray6 mb-2">
                  商品名 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newListing.title}
                  onChange={handleListingInputChange}
                  placeholder="例: レインボーフラッグ Tシャツ"
                  className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* カテゴリー */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-carat-gray6 mb-2">
                    カテゴリー
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={newListing.category}
                    onChange={handleListingInputChange}
                    className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black focus:border-transparent"
                  >
                    <option value="ファッション">ファッション</option>
                    <option value="本・雑誌">本・雑誌</option>
                    <option value="グッズ">グッズ</option>
                    <option value="アクセサリー">アクセサリー</option>
                    <option value="インテリア">インテリア</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                {/* 商品の状態 */}
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-carat-gray6 mb-2">
                    商品の状態
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={newListing.condition}
                    onChange={handleListingInputChange}
                    className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black focus:border-transparent"
                  >
                    <option value="new">新品</option>
                    <option value="like_new">未使用に近い</option>
                    <option value="good">目立った傷や汚れなし</option>
                    <option value="fair">やや傷や汚れあり</option>
                  </select>
                </div>
              </div>

              {/* 商品説明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-carat-gray6 mb-2">
                  商品説明 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newListing.description}
                  onChange={handleListingInputChange}
                  placeholder="商品の詳細な説明を入力してください..."
                  rows={4}
                  className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 価格 */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-carat-gray6 mb-2">
                    価格 *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newListing.price}
                      onChange={handleListingInputChange}
                      placeholder="1000"
                      min="100"
                      className="w-full px-4 py-3 pr-12 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black focus:border-transparent"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-carat-gray6">円</span>
                  </div>
                </div>

                {/* 発送元地域 */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-carat-gray6 mb-2">
                    発送元地域 *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newListing.location}
                    onChange={handleListingInputChange}
                    placeholder="例: 東京都渋谷区"
                    className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* 注意事項 */}
              <div className="bg-carat-gray2 p-4 rounded-lg">
                <h4 className="font-medium text-carat-gray6 mb-2">出品時の注意事項</h4>
                <ul className="text-sm text-carat-gray6 space-y-1">
                  <li>• 購入者との連絡は専用チャットで行ってください</li>
                  <li>• 個人情報の交換は禁止されています</li>
                  <li>• 取引完了後は必ず完了報告をしてください</li>
                  <li>• 不適切な商品の出品は禁止されています</li>
                </ul>
              </div>

              {/* ボタン */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-carat-black text-carat-white py-3 px-4 rounded-lg font-semibold hover:bg-carat-gray6 transition-all duration-300"
                >
                  出品する
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateListing(false)}
                  className="px-6 py-3 border border-carat-gray3 text-carat-gray6 rounded-lg hover:bg-carat-gray1 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listing Detail Modal */}
      {showListingDetail && selectedListing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowListingDetail(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-carat-black">{selectedListing.title}</h3>
              <button
                onClick={() => setShowListingDetail(false)}
                className="text-carat-gray6 hover:text-carat-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 商品画像 */}
              <div>
                <div className="aspect-square bg-carat-gray2 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                {selectedListing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedListing.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-square bg-carat-gray2 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${selectedListing.title} ${index + 2}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 商品情報 */}
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-carat-black">
                      ¥{selectedListing.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-carat-gray2 text-carat-gray6 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedListing.category}
                      </span>
                      <span className="bg-carat-gray2 text-carat-gray6 px-3 py-1 rounded-full text-sm font-medium">
                        {conditionLabels[selectedListing.condition]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-carat-black mb-2">商品説明</h4>
                      <p className="text-carat-gray6 leading-relaxed">{selectedListing.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-carat-gray6">
                      <div>
                        <span>発送元</span>
                        <p className="font-medium flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {selectedListing.location}
                        </p>
                      </div>
                      <div>
                        <span>出品日</span>
                        <p className="font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {getTimeAgo(selectedListing.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-carat-black mb-3">出品者情報</h4>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-carat-black rounded-full flex items-center justify-center text-carat-white text-lg font-bold mr-4">
                          {selectedListing.seller_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-carat-black">{selectedListing.seller_name}</p>
                          <p className="text-sm text-carat-gray6">会員</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="space-y-3">
                  {/* 出品者向けボタン */}
                  {isEditing ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const tkn = localStorage.getItem('token');
                        
                        // 新しい画像があればアップロード
                        const mediaIds: number[] = [];
                        for (const file of editListing.newImages) {
                          const formData = new FormData();
                          formData.append('file', file);
                          const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${tkn}` },
                            body: formData
                          });
                          if (uploadResponse.ok) {
                            const uploadResult = await uploadResponse.json();
                            mediaIds.push(uploadResult.id);
                          }
                        }
                        
                        const updateData: Record<string, unknown> = {
                          title: editListing.title,
                          body: editListing.description,
                          category: 'marketplace',
                          subcategory: editListing.category,
                          goal_amount: parseInt(editListing.price) || 0,
                          excerpt: editListing.location
                        };
                        if (mediaIds.length > 0) {
                          updateData.media_ids = mediaIds;
                        }
                        
                        const response = await fetch(`${API_URL}/api/posts/${selectedListing.id}`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${tkn}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(updateData)
                        });
                        if (response.ok) {
                          const updated = await response.json();
                          const updatedListing = {
                            ...selectedListing,
                            title: updated.title || '',
                            description: updated.body || '',
                            price: updated.goal_amount || 0,
                            category: updated.subcategory || 'その他',
                            location: updated.excerpt || '',
                            images: updated.media_urls || selectedListing.images
                          };
                          setListings(prev => prev.map(l => l.id === selectedListing.id ? updatedListing : l));
                          setSelectedListing(updatedListing);
                          setIsEditing(false);
                          alert('更新しました');
                        } else {
                          alert('更新に失敗しました');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">商品名</label>
                          <input
                            type="text"
                            value={editListing.title}
                            onChange={(e) => setEditListing({ ...editListing, title: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">商品説明</label>
                          <textarea
                            value={editListing.description}
                            onChange={(e) => setEditListing({ ...editListing, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">価格（円）</label>
                          <input
                            type="number"
                            value={editListing.price}
                            onChange={(e) => setEditListing({ ...editListing, price: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="例: 3000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">発送元</label>
                          <input
                            type="text"
                            value={editListing.location}
                            onChange={(e) => setEditListing({ ...editListing, location: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">画像を変更</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              if (e.target.files) {
                                setEditListing({ ...editListing, newImages: Array.from(e.target.files) });
                              }
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          {editListing.newImages.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">{editListing.newImages.length}枚の画像を選択中</p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button type="submit" className="flex-1 bg-black text-white py-2 rounded-lg">保存</button>
                          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border py-2 rounded-lg">キャンセル</button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-carat-gray2 p-3 rounded-lg">
                          <p className="text-sm text-carat-gray6 font-medium">あなたの出品です</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditListing({
                              title: selectedListing.title,
                              description: selectedListing.description,
                              price: String(selectedListing.price),
                              category: selectedListing.category,
                              location: selectedListing.location,
                              newImages: []
                            });
                            setIsEditing(true);
                          }}
                          className="w-full bg-carat-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-carat-gray6 transition-colors flex items-center justify-center gap-2"
                        >
                          編集する
                        </button>
                        <button
                          onClick={() => handleWithdrawListing(selectedListing)}
                          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          出品を取り下げる
                        </button>
                      </div>
                    )
                  }
                </div>

                {/* 注意事項 */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">取引時の注意</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 連絡は専用チャットで行ってください</li>
                    <li>• 個人情報の交換は禁止されています</li>
                    <li>• 不審な取引は運営に報告してください</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && selectedListing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">出品を取り下げ</h3>
            <p className="text-gray-600 mb-6">
              「{selectedListing.title}」を取り下げますか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmWithdraw}
                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                取り下げる
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedListing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">出品者を評価</h3>
            <p className="text-gray-600 mb-6">
              「{selectedListing.title}」の出品者「{selectedListing.seller_name}」さんを評価してください。
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => submitReview('good', '良い取引でした')}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  👍 良い
                </button>
                <button
                  onClick={() => submitReview('neutral', '普通の取引でした')}
                  className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                >
                  😐 普通
                </button>
                <button
                  onClick={() => submitReview('bad', '問題のある取引でした')}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  👎 悪い
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント（任意）
              </label>
              <textarea
                placeholder="取引の感想をお聞かせください..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowReviewModal(false)}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              後で評価する
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
