import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ChevronRight } from 'lucide-react';
import { API_URL } from '../../config';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  recipient_name: string;
  postal_code?: string;
  address: string;
  phone?: string;
  email?: string;
  paid_at?: string;
  created_at: string;
  items: OrderItem[];
}

const JewelryOrderComplete: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/jewelry/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        navigate('/jewelry');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      navigate('/jewelry');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString('ja-JP')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ご注文ありがとうございます
        </h1>
        <p className="text-gray-600">
          注文番号: <span className="font-semibold">#{order.id}</span>
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-pink-50 px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-500" />
            注文内容
          </h2>
        </div>

        <div className="p-6">
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-800">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>合計</span>
              <span className="text-pink-600">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">配送先情報</h2>
        </div>

        <div className="p-6 space-y-2">
          <p>
            <span className="text-gray-500">氏名:</span>{' '}
            <span className="font-medium">{order.recipient_name}</span>
          </p>
          {order.postal_code && (
            <p>
              <span className="text-gray-500">郵便番号:</span>{' '}
              <span className="font-medium">{order.postal_code}</span>
            </p>
          )}
          <p>
            <span className="text-gray-500">住所:</span>{' '}
            <span className="font-medium">{order.address}</span>
          </p>
          {order.phone && (
            <p>
              <span className="text-gray-500">電話番号:</span>{' '}
              <span className="font-medium">{order.phone}</span>
            </p>
          )}
          {order.email && (
            <p>
              <span className="text-gray-500">メール:</span>{' '}
              <span className="font-medium">{order.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">注文状況</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : order.status === 'shipped'
                  ? 'bg-blue-100 text-blue-700'
                  : order.status === 'delivered'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {order.status === 'paid'
                ? '決済完了'
                : order.status === 'shipped'
                ? '発送済み'
                : order.status === 'delivered'
                ? '配達完了'
                : '処理中'}
            </div>
            {order.paid_at && (
              <span className="text-sm text-gray-500">
                {formatDate(order.paid_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/jewelry')}
          className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold hover:bg-pink-600 flex items-center justify-center gap-2"
        >
          買い物を続ける
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/jewelry/orders')}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
        >
          注文履歴を見る
        </button>
      </div>

      {/* Note */}
      <p className="text-center text-sm text-gray-500 mt-6">
        ご注文に関するお問い合わせは、注文番号をお伝えください。
      </p>
    </div>
  );
};

export default JewelryOrderComplete;
