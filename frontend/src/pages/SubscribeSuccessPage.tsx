import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { API_URL } from '../config';

const SubscribeSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_success, setSuccess] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycStarted, setKycStarted] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError(t('subscribe.success.no_session'));
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stripe/checkout-session/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(t('subscribe.success.verification_failed'));
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.access_token) {
          // Store the token for auto-login
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setSuccess(true);
        } else if (data.status === 'pending') {
          // Payment still processing
          setError(t('subscribe.success.payment_pending'));
        } else {
          setError(t('subscribe.success.verification_failed'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('subscribe.success.unknown_error'));
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, t]);

  const handleContinue = () => {
    navigate('/account');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleStartKyc = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/account');
      return;
    }
    setKycLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-identity-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'KYC session creation failed');
      }
      const data = await res.json();

      const configRes = await fetch(`${API_URL}/api/stripe/config`);
      const configData = await configRes.json();

      const stripe = await loadStripe(configData.publishable_key);
      if (!stripe) throw new Error('Failed to load Stripe');

      const { error: verifyError } = await stripe.verifyIdentity(data.client_secret);
      if (verifyError) {
        console.error('Stripe Identity error:', verifyError);
      } else {
        setKycStarted(true);
      }
    } catch (e) {
      console.error('KYC error:', e);
      // Fallback: navigate to account page for KYC
      navigate('/account');
    } finally {
      setKycLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('subscribe.success.verifying')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-black mb-4">
              {t('subscribe.success.error_title')}
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
            >
              {t('subscribe.success.go_to_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <img src="/images/logo02.png" alt="Carat Logo" className="h-16 w-auto" />
          </div>
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-black mb-4">
            {t('subscribe.success.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('subscribe.success.message')}
          </p>
          
          {kycStarted ? (
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-green-800 font-semibold mb-2">
                {t('kyc.submitted_title')}
              </h3>
              <p className="text-green-700 text-sm">
                {t('kyc.submitted_message')}
              </p>
            </div>
          ) : (
            <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
              <h3 className="text-purple-900 font-semibold mb-2">
                {t('subscribe.success.next_step_title')}
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                {t('subscribe.success.next_step_message')}
              </p>
              <button
                onClick={handleStartKyc}
                disabled={kycLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {kycLoading ? t('common.loading') : t('kyc.start_button')}
              </button>
            </div>
          )}
          
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-lg transition-all duration-200"
          >
            {t('subscribe.success.continue_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeSuccessPage;
