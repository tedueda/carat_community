import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, ShoppingBag, Plus, MapPin, Clock, X } from 'lucide-react';
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
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const token = localStorage.getItem('token');
  const currentUserId = user?.id;
  
  // Debug: Log auth state for troubleshooting
  useEffect(() => {
    console.log('🔍 MarketplacePage Auth Debug:', {
      authLoading,
      user,
      currentUserId,
      token: token ? 'exists' : 'null'
    });
  }, [authLoading, user, currentUserId, token]);

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showListingDetail, setShowListingDetail] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const conditionLabels = {
    new: '新品',
    like_new: '未使用に近い',
    good: '目立った傷や汚れなし',
    fair: 'やや傷や汚れあり'
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/?category=marketplace`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const listingsData: Listing[] = data.map((item: any) => ({
          id: item.id,
          title: item.title || '無題',
          description: item.body || '',
          price: item.goal_amount || 0,
          condition: 'good',
          category: item.subcategory || 'その他',
          location: '大阪府',
          seller_name: item.user_display_name || '匿名',
          seller_id: Number(item.user_id),
          images: item.media_urls && item.media_urls.length > 0 ? item.media_urls : ['/placeholder.jpg'],
          created_at: item.created_at,
          status: 'active',
          is_favorited: item.is_liked || false
        }));
        setListings(listingsData);
      }
    } catch (error) {
      console.error('商品取得エラー:', error);
    }
  };

  const handleFavorite = async (listingId: number) => {
    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      if (listing.is_favorited) {
        await fetch(`${API_URL}/api/posts/${listingId}/like`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch(`${API_URL}/api/posts/${listingId}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      setListings(listings.map(l => 
        l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
      ));
    } catch (error) {
      console.error('お気に入りエラー:', error);
    }
  };

  const handleSendMessage = async (messageType: 'purchase' | 'inquiry') => {
    if (!selectedListing) return;

    const message = messageType === 'purchase'
      ? `「${selectedListing.title}」を購入したいです。`
      : `「${selectedListing.title}」について質問があります。`;

    try {
      const response = await fetch(`${API_URL}/api/donation/support-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: selectedListing.id,
          amount: null,
          message: message
        })
      });

      if (response.ok) {
        setShowContactModal(false);
        setShowListingDetail(false);
        alert('メッセージを送信しました！');
        navigate(`/matching/chats`);
      } else {
        alert('メッセージの送信に失敗しました');
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      alert('エラーが発生しました');
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-carat-black mb-6">マーケット</h1>
          <p className="text-2xl text-carat-gray5 mb-8">会員同士で安心・安全な売買取引</p>
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
        </div>
      </section>

      {/* Search and Actions */}
      <section className="py-8 bg-carat-white border-b border-carat-gray2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/members/marketplace/new')}
                className="bg-carat-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-carat-gray6 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                出品する
              </button>
              <button
                onClick={() => navigate('/members/favorites')}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-all flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                お気に入り一覧
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => {
                  setSelectedListing(listing);
                  setShowListingDetail(true);
                }}
              >
                {/* Image */}
                <div className="relative h-64 bg-carat-gray2">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-carat-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-carat-gray6">
                    {conditionLabels[listing.condition]}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(listing.id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                      listing.is_favorited
                        ? 'bg-pink-500 text-white'
                        : 'bg-carat-white/90 text-carat-gray6 hover:bg-pink-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${listing.is_favorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-carat-black mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-carat-black mb-3">
                    ¥{listing.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-carat-gray5 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-carat-gray5 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>今日</span>
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${listing.seller_id}`);
                      }}
                      className="flex items-center hover:opacity-70 transition-opacity"
                    >
                      <div className="w-8 h-8 bg-carat-black rounded-full flex items-center justify-center text-carat-white text-sm font-bold">
                        {listing.seller_name.charAt(0)}
                      </div>
                      <span className="ml-2 text-sm text-sky-500 hover:text-sky-600 font-medium">
                        {listing.seller_name}
                      </span>
                    </button>
                  </div>

                  {/* Chat Button (only for non-sellers) */}
                  {listing.seller_id !== currentUserId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedListing(listing);
                        setShowContactModal(true);
                      }}
                      className="w-full bg-carat-black text-white py-2 px-3 rounded-lg font-medium hover:bg-carat-gray6 transition-all flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      チャットで連絡
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {showListingDetail && selectedListing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowListingDetail(false)}>
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-carat-gray2 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-carat-black">{selectedListing.title}</h2>
              <button
                onClick={() => setShowListingDetail(false)}
                className="p-2 hover:bg-carat-gray1 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6">
              {/* Left: Image */}
              <div className="flex flex-col space-y-4">
                <div className="aspect-square bg-carat-gray2 rounded-xl overflow-hidden">
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Chat Button (bottom left, for non-sellers) */}
                {/* Debug: Show button state */}
                {(() => {
                  const sellerId = Number(selectedListing.seller_id);
                  const userId = currentUserId ? Number(currentUserId) : null;
                  const shouldShow = !authLoading && userId !== null && sellerId !== userId;
                  console.log('🔍 Chat Button Debug:', {
                    authLoading,
                    currentUserId,
                    sellerId: selectedListing.seller_id,
                    sellerIdNum: sellerId,
                    userIdNum: userId,
                    shouldShow
                  });
                  return null;
                })()}
                {!authLoading && currentUserId !== undefined && Number(selectedListing.seller_id) !== Number(currentUserId) && (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-carat-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-carat-gray6 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    <MessageCircle className="w-5 h-5" />
                    チャットで連絡
                  </button>
                )}
              </div>

              {/* Right: Info */}
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
                          今日
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-carat-black mb-3">出品者情報</h4>
                      <button
                        onClick={() => {
                          navigate(`/profile/${selectedListing.seller_id}`);
                          setShowListingDetail(false);
                        }}
                        className="flex items-center hover:opacity-70 transition-opacity w-full text-left"
                      >
                        <div className="w-12 h-12 bg-carat-black rounded-full flex items-center justify-center text-carat-white text-lg font-bold mr-4">
                          {selectedListing.seller_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sky-500 hover:text-sky-600 hover:underline">
                            {selectedListing.seller_name}
                          </p>
                          <p className="text-sm text-carat-gray6">会員</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
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

      {/* Contact Selection Modal */}
      {showContactModal && selectedListing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">連絡方法を選択</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleSendMessage('purchase')}
                className="w-full bg-carat-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-carat-gray6 transition-colors text-lg"
              >
                購入する
              </button>
              <button
                onClick={() => handleSendMessage('inquiry')}
                className="w-full bg-white border-2 border-carat-black text-carat-black py-4 px-6 rounded-lg font-semibold hover:bg-carat-gray1 transition-colors text-lg"
              >
                問い合わせ
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-carat-gray2 text-carat-gray6 py-3 px-6 rounded-lg font-medium hover:bg-carat-gray3 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
