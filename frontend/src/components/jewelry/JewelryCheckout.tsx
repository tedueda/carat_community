import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ChevronLeft, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
    images: { id: number; image_url: string; display_order: number }[];
  };
}

interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
}

interface ShippingInfo {
  recipient_name: string;
  postal_code: string;
  prefecture: string;
  city_address: string;
  building: string;
  phone: string;
  email: string;
}

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const CheckoutForm: React.FC<{
  cart: Cart;
  shippingInfo: ShippingInfo;
  onSuccess: (orderId: number) => void;
}> = ({ cart, shippingInfo, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const token = localStorage.getItem('token');

    try {
      // 1. Create order
      const orderResponse = await fetch(`${API_URL}/jewelry/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_info: {
            ...shippingInfo,
            address: `${shippingInfo.prefecture}${shippingInfo.city_address}${shippingInfo.building ? ' ' + shippingInfo.building : ''}`
          }
        })
      });

      if (!orderResponse.ok) {
        const orderError = await orderResponse.json();
        throw new Error(orderError.detail || '注文の作成に失敗しました');
      }

      const order = await orderResponse.json();

      // 2. Create payment intent
      const intentResponse = await fetch(`${API_URL}/jewelry/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: order.id
        })
      });

      if (!intentResponse.ok) {
        const intentError = await intentResponse.json();
        throw new Error(intentError.detail || '決済の初期化に失敗しました');
      }

      const { client_secret, payment_intent_id } = await intentResponse.json();

      // 3. Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('カード情報が入力されていません');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingInfo.recipient_name,
              email: shippingInfo.email,
              phone: shippingInfo.phone
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || '決済に失敗しました');
      }

      if (paymentIntent?.status === 'succeeded') {
        // 4. Confirm payment on backend
        await fetch(`${API_URL}/jewelry/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: order.id,
            payment_intent_id: payment_intent_id
          })
        });

        onSuccess(order.id);
      } else {
        throw new Error('決済が完了しませんでした');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '決済に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString('ja-JP')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">注文内容</h3>
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
        <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
          <span>合計金額</span>
          <span className="text-gray-900">{formatPrice(cart.total_amount + 1100)}</span>
        </div>
      </div>

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カード情報
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          テスト用カード: 4242 4242 4242 4242
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            処理中...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {formatPrice(cart.total_amount)}を支払う
          </>
        )}
      </button>
    </form>
  );
};

const JewelryCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    recipient_name: '',
    postal_code: '',
    prefecture: '',
    city_address: '',
    building: '',
    phone: '',
    email: ''
  });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  useEffect(() => {
    fetchCart();
    fetchUserInfo();
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
        if (!data.items || data.items.length === 0) {
          navigate('/jewelry/cart');
          return;
        }
        setCart(data);
      } else if (response.status === 403) {
        navigate('/premium');
      } else {
        navigate('/jewelry/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      navigate('/jewelry/cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        setShippingInfo((prev) => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const validateShipping = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.recipient_name.trim()) {
      newErrors.recipient_name = '氏名を入力してください';
    }
    if (!shippingInfo.prefecture.trim()) {
      newErrors.prefecture = '都道府県を選択してください';
    }
    if (!shippingInfo.city_address.trim()) {
      newErrors.city_address = '市町村・番地を入力してください';
    }
    if (!shippingInfo.phone.trim() && !shippingInfo.email.trim()) {
      newErrors.phone = '電話番号またはメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePaymentSuccess = (orderId: number) => {
    navigate(`/jewelry/complete/${orderId}`);
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

  if (!cart) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => (step === 'payment' ? setStep('shipping') : navigate('/jewelry/cart'))}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>{step === 'payment' ? '配送先情報に戻る' : 'カートに戻る'}</span>
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'shipping' ? 'bg-gray-900 text-white' : 'bg-gray-600 text-white'
            }`}
          >
            1
          </div>
          <span className="ml-2 text-sm">配送先情報</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-gray-900 text-white' : 'bg-gray-300 text-gray-500'
            }`}
          >
            2
          </div>
          <span className="ml-2 text-sm">お支払い</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {step === 'shipping' ? (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">配送先情報</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingInfo.recipient_name}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, recipient_name: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.recipient_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="山田 太郎"
              />
              {errors.recipient_name && (
                <p className="text-red-500 text-sm mt-1">{errors.recipient_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                type="text"
                value={shippingInfo.postal_code}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, postal_code: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所1：都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingInfo.prefecture}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, prefecture: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent ${
                  errors.prefecture ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                <option value="北海道">北海道</option>
                <option value="青森県">青森県</option>
                <option value="岩手県">岩手県</option>
                <option value="宮城県">宮城県</option>
                <option value="秋田県">秋田県</option>
                <option value="山形県">山形県</option>
                <option value="福島県">福島県</option>
                <option value="茨城県">茨城県</option>
                <option value="栃木県">栃木県</option>
                <option value="群馬県">群馬県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="新潟県">新潟県</option>
                <option value="富山県">富山県</option>
                <option value="石川県">石川県</option>
                <option value="福井県">福井県</option>
                <option value="山梨県">山梨県</option>
                <option value="長野県">長野県</option>
                <option value="岐阜県">岐阜県</option>
                <option value="静岡県">静岡県</option>
                <option value="愛知県">愛知県</option>
                <option value="三重県">三重県</option>
                <option value="滋賀県">滋賀県</option>
                <option value="京都府">京都府</option>
                <option value="大阪府">大阪府</option>
                <option value="兵庫県">兵庫県</option>
                <option value="奈良県">奈良県</option>
                <option value="和歌山県">和歌山県</option>
                <option value="鳥取県">鳥取県</option>
                <option value="島根県">島根県</option>
                <option value="岡山県">岡山県</option>
                <option value="広島県">広島県</option>
                <option value="山口県">山口県</option>
                <option value="徳島県">徳島県</option>
                <option value="香川県">香川県</option>
                <option value="愛媛県">愛媛県</option>
                <option value="高知県">高知県</option>
                <option value="福岡県">福岡県</option>
                <option value="佐賀県">佐賀県</option>
                <option value="長崎県">長崎県</option>
                <option value="熊本県">熊本県</option>
                <option value="大分県">大分県</option>
                <option value="宮崎県">宮崎県</option>
                <option value="鹿児島県">鹿児島県</option>
                <option value="沖縄県">沖縄県</option>
              </select>
              {errors.prefecture && (
                <p className="text-red-500 text-sm mt-1">{errors.prefecture}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所2：市町村・番地 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingInfo.city_address}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, city_address: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent ${
                  errors.city_address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="大阪市阿倍野区阪南町6-1-5"
              />
              {errors.city_address && (
                <p className="text-red-500 text-sm mt-1">{errors.city_address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所3：マンション名・部屋番号
              </label>
              <input
                type="text"
                value={shippingInfo.building}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, building: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="レインボーマンション101号室"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={shippingInfo.phone}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, phone: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="090-1234-5678"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={shippingInfo.email}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">注文内容</h3>
              {cart.items.map((item) => {
                const subtotal = item.product.price * item.quantity;
                const tax = item.product.price_includes_tax ? 0 : Math.floor(subtotal * 0.1);
                const shippingFee = 1100; // 仮の送料
                
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
              <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                <span>合計金額</span>
                <span className="text-gray-900">{formatPrice(cart.total_amount + 1100)}</span>
              </div>
            </div>

            {/* Privacy Agreement */}
            <div className="mt-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 mr-3 w-5 h-5"
                />
                <span className="text-sm text-gray-700">
                  <a href="/privacy" target="_blank" className="text-gray-900 underline hover:text-gray-700">
                    個人情報の取り扱い
                  </a>
                  に同意します <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreedToPrivacy}
              className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg ${
                agreedToPrivacy
                  ? 'bg-gray-900 text-white hover:bg-black'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              お支払いへ進む
            </button>
          </form>
        ) : (
          <Elements stripe={stripePromise}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">お支払い</h2>
            <CheckoutForm
              cart={cart}
              shippingInfo={shippingInfo}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default JewelryCheckout;
