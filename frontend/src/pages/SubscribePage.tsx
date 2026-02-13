import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { API_URL } from '../config';

interface BillingStatus {
  kyc_status: string;
  membership_status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

const SubscribePageNew: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchBillingStatus();
  }, [token, navigate]);

  const fetchBillingStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/billing/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBillingStatus(data);
      }
    } catch (error) {
      console.error('Error fetching billing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartKyc = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/kyc/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.alreadyVerified) {
          // Already verified, refresh status
          await fetchBillingStatus();
          return;
        }
        
        if (data.url) {
          // Redirect to Stripe Identity
          window.location.assign(data.url);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '本人確認の開始に失敗しました。');
      }
    } catch (error) {
      console.error('Error starting KYC:', error);
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.assign(data.url);
        }
      } else {
        const errorData = await response.json();
        
        if (response.status === 403) {
          setError('サブスクリプションを開始するには、まず本人確認を完了してください。');
        } else {
          setError(errorData.detail || 'チェックアウトの開始に失敗しました。');
        }
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const isKycVerified = billingStatus?.kyc_status === 'verified';
  const isPaid = billingStatus?.membership_status === 'paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Carat プレミアム会員</h1>
            <p className="text-lg opacity-90">すべての機能をご利用いただけます</p>
            <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-4xl font-bold">¥1,000<span className="text-lg font-normal">/月</span></p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Already Subscribed */}
            {isPaid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-900">サブスクリプション有効</h3>
                    <p className="text-sm text-green-700">プレミアム会員として登録されています。</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* KYC Status */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">登録ステップ</h2>
              
              {/* Step 1: KYC */}
              <div className="mb-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isKycVerified ? 'bg-green-500' : 'bg-purple-500'
                  } text-white font-bold mr-4`}>
                    {isKycVerified ? <CheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">本人確認（KYC）</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Stripe Identityを使用した本人確認が必要です。パスポート、運転免許証、またはIDカードをご用意ください。
                    </p>
                    
                    {billingStatus?.kyc_status === 'unverified' && (
                      <button
                        onClick={handleStartKyc}
                        disabled={processing}
                        className="flex items-center bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            処理中...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            本人確認を開始
                          </>
                        )}
                      </button>
                    )}
                    
                    {billingStatus?.kyc_status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-700">本人確認を処理中です...</p>
                      </div>
                    )}
                    
                    {billingStatus?.kyc_status === 'verified' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <p className="text-sm text-green-700 font-semibold">本人確認完了</p>
                        </div>
                      </div>
                    )}
                    
                    {billingStatus?.kyc_status === 'failed' && (
                      <div className="space-y-2">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">本人確認に失敗しました。</p>
                        </div>
                        <button
                          onClick={handleStartKyc}
                          disabled={processing}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          再試行
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Subscription */}
              <div className="mb-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isPaid ? 'bg-green-500' : isKycVerified ? 'bg-purple-500' : 'bg-gray-300'
                  } text-white font-bold mr-4`}>
                    {isPaid ? <CheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">サブスクリプション登録</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      月額¥1,000でプレミアム機能をご利用いただけます。
                    </p>
                    
                    {!isPaid && isKycVerified && (
                      <button
                        onClick={handleCheckout}
                        disabled={processing}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                            処理中...
                          </>
                        ) : (
                          'サブスクリプションを開始'
                        )}
                      </button>
                    )}
                    
                    {!isPaid && !isKycVerified && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">まず本人確認を完了してください</p>
                      </div>
                    )}
                    
                    {isPaid && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <p className="text-sm text-green-700 font-semibold">サブスクリプション有効</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">プレミアム会員特典</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  投稿・コメント機能
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  マッチング機能
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  サロン・チャット機能
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  フリマ・作品販売機能
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribePageNew;
