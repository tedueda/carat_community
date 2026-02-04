import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Search } from 'lucide-react';
import jewelryBanner from '../../assets/images/jewelry-banner.jpg';

interface JewelryProduct {
  id: number;
  name: string;
  description: string;
  material?: string;
  size?: string;
  price: number;
  price_includes_tax: boolean;
  stock: number;
  is_active: boolean;
  category: string;
  has_certificate: boolean;
  has_gem_id: boolean;
  is_sold_out: boolean;
  images: { id: number; image_url: string; display_order: number }[];
  created_at: string;
}

const JEWELRY_CATEGORIES = [
  { id: 'earring' },
  { id: 'necklace' },
  { id: 'bracelet' },
  { id: 'brooch' },
  { id: 'ring' },
  { id: 'other' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const JewelryProductList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/jewelry/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const hasImage = product.images && product.images.length > 0;
    return matchesSearch && matchesCategory && hasImage;
  });

  const formatPrice = (price: number, includesTax: boolean) => {
    const formatted = price.toLocaleString('ja-JP');
    return `¥${formatted}${includesTax ? '（税込）' : '（税別）'}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-800">{t('jewelry.title')}</h1>
        </div>
        <img 
          src={jewelryBanner} 
          alt={t('jewelry.bannerAlt')} 
          className="w-full max-w-2xl mx-auto rounded-lg shadow-md object-cover h-48"
        />
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('jewelry.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          />
        </div>
        
        {/* カテゴリーフィルター */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === '' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('jewelry.allCategories')}
          </button>
          {JEWELRY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(`jewelry.categories.${cat.id}`)}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('jewelry.noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/jewelry/${product.id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {/* カテゴリーバッジ */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded">
                    {t(`jewelry.categories.${product.category}`)}
                  </span>
                </div>
                {product.is_sold_out && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <span className="text-white font-bold text-xl tracking-wider">Sold Out</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-900 font-bold text-lg">
                  {formatPrice(product.price, product.price_includes_tax)}
                </p>
                {product.material && (
                  <p className="text-sm text-gray-500 mt-1">素材: {product.material}</p>
                )}
                {/* 鑑定証・宝石識別証バッジ */}
                {(product.has_certificate || product.has_gem_id) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.has_certificate && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300">鑑定証</span>
                    )}
                    {product.has_gem_id && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300">宝石識別証</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JewelryProductList;
