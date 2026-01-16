import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ChevronLeft, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
  address: string;
  phone: string;
  email: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
          shipping_info: shippingInfo
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
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm mb-2">
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
          <span>合計</span>
          <span className="text-pink-600">{formatPrice(cart.total_amount)}</span>
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
        className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    address: '',
    phone: '',
    email: ''
  });
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
      const response = await fetch(`${API_URL}/users/me`, {
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
    if (!shippingInfo.address.trim()) {
      newErrors.address = '住所を入力してください';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
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
        className="flex items-center text-gray-600 hover:text-pink-500 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>{step === 'payment' ? '配送先情報に戻る' : 'カートに戻る'}</span>
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'shipping' ? 'bg-pink-500 text-white' : 'bg-green-500 text-white'
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
              step === 'payment' ? 'bg-pink-500 text-white' : 'bg-gray-300 text-gray-500'
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, address: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="東京都渋谷区..."
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">注文内容</h3>
              <div className="flex justify-between font-bold">
                <span>合計</span>
                <span className="text-pink-600">{formatPrice(cart.total_amount)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-pink-600"
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
