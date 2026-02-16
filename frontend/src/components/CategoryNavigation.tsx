import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Sparkles, 
  Palette, 
  Heart, 
  MapPin, 
  Store, 
  MessageSquare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Category } from '../types/category';
import { API_URL } from '../config';

// アイコンマッピング
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Sparkles,
  Palette,
  Heart,
  MapPin,
  Store,
  MessageSquare,
};

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { categorySlug, subcategorySlug } = useParams();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const useMock = import.meta.env.VITE_USE_MOCK === 'true' || 
                      window.location.hostname.includes('github.io');
      
      if (useMock) {
        const response = await fetch(`${import.meta.env.BASE_URL}categories.json`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } else {
        const response = await fetch(`${API_URL}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      }
    } catch (error) {
      console.error('カテゴリー取得エラー:', error);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}categories.json`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (fallbackError) {
        console.error('モックデータ取得エラー:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="text-sm text-gray-500">読み込み中...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* デスクトップナビゲーション */}
        <div className="hidden md:flex md:items-center md:space-x-1 py-4">
          {categories.map((category) => {
            const Icon = category.icon && iconMap[category.icon] ? iconMap[category.icon] : Sparkles;
            const isActive = categorySlug === category.slug;
            
            return (
              <div key={category.id} className="relative group">
                <Link
                  to={`/category/${category.slug}`}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-lg
                    font-serif text-sm font-medium tracking-wide
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-900 gold-border border' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-yellow-800'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'gold-accent' : ''}`} />
                  {category.name}
                </Link>
                
                {/* サブカテゴリードロップダウン */}
                {category.subcategories.length > 0 && (
                  <div className="
                    absolute left-0 mt-2 w-64 rounded-xl shadow-lg bg-white border border-gray-100
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 z-50
                  ">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.name}
                      </div>
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${category.slug}/${sub.slug}`}
                          className={`
                            block px-4 py-2 text-sm
                            transition-colors duration-150
                            ${subcategorySlug === sub.slug
                              ? 'bg-yellow-50 text-yellow-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-yellow-800'
                            }
                          `}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* モバイルナビゲーション */}
        <div className="md:hidden py-4">
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon && iconMap[category.icon] ? iconMap[category.icon] : Sparkles;
              const isActive = categorySlug === category.slug;
              const isExpanded = expandedCategory === category.id;
              
              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/category/${category.slug}`}
                      className={`
                        flex-1 inline-flex items-center px-3 py-2 rounded-lg
                        font-serif text-sm font-medium
                        transition-colors duration-150
                        ${isActive 
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-900' 
                          : 'text-gray-700'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${isActive ? 'gold-accent' : ''}`} />
                      {category.name}
                    </Link>
                    
                    {category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* モバイルサブカテゴリー */}
                  {isExpanded && category.subcategories.length > 0 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${category.slug}/${sub.slug}`}
                          className={`
                            block px-3 py-2 rounded-md text-sm
                            transition-colors duration-150
                            ${subcategorySlug === sub.slug
                              ? 'bg-yellow-50 text-yellow-900 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-yellow-800'
                            }
                          `}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
