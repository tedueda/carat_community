import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ChevronLeft } from 'lucide-react';
import { API_URL } from '../../config';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    price_includes_tax: boolean;
    stock: number;
    images: { id: number; image_url: string; display_order: number }[];
  };
}

interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
}


const JewelryCart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/jewelry/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else if (response.status === 403) {
        navigate('/premium');
      } else {
        setError('カートの取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setError('カートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/jewelry/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const error = await response.json();
        setError(error.detail || '数量の更新に失敗しました');
      }
    } catch {
      setError('数量の更新に失敗しました');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/jewelry/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchCart();
      } else {
        setError('商品の削除に失敗しました');
      }
    } catch {
      setError('商品の削除に失敗しました');
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString('ja-JP')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/jewelry')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>買い物を続ける</span>
      </button>

      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-8 h-8 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-800">ショッピングカート</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            閉じる
          </button>
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">カートは空です</p>
          <button
            onClick={() => navigate('/jewelry')}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black"
          >
            商品を見る
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {cart.items.map((item, index) => (
              <div
                key={item.id}
                className={`flex gap-4 p-4 ${
                  index !== cart.items.length - 1 ? 'border-b' : ''
                }`}
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0].image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3
                    className="font-semibold text-gray-800 cursor-pointer hover:text-gray-900"
                    onClick={() => navigate(`/jewelry/${item.product_id}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-gray-900 font-bold mt-1">
                    {formatPrice(item.product.price)}
                    {item.product.price_includes_tax ? '（税込）' : '（税別）'}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={
                          updating === item.id ||
                          (item.product.stock > 0 && item.quantity >= item.product.stock)
                        }
                        className="p-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-sm text-gray-500">小計</p>
                  <p className="font-bold text-gray-800">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">注文内容</h3>
            
            {cart.items.map((item) => {
              const subtotal = item.product.price * item.quantity;
              const tax = item.product.price_includes_tax ? 0 : Math.floor(subtotal * 0.1);
              const shippingFee = 1100;
              
              return (
                <div key={item.id} className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>{formatPrice(subtotal)}{item.product.price_includes_tax ? '（税込）' : '（税別）'}</span>
                  </div>
                  {!item.product.price_includes_tax && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>消費税（10%）</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>送料</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                </div>
              );
            })}
            
            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">合計金額</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(cart.total_amount + 1100)}
              </span>
            </div>

            <button
              onClick={() => navigate('/jewelry/checkout')}
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg bg-gray-900 text-white hover:bg-black mt-6"
            >
              購入手続きへ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryCart;
