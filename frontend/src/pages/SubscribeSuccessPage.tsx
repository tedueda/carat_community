import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SubscribeSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_success, setSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError(t('subscribe.success.no_session'));
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stripe/checkout-session/${sessionId}`);
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">{t('subscribe.success.verifying')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {t('subscribe.success.error_title')}
            </h1>
            <p className="text-purple-200 mb-6">{error}</p>
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t('subscribe.success.go_to_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {t('subscribe.success.title')}
          </h1>
          <p className="text-purple-200 mb-6">
            {t('subscribe.success.message')}
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">
              {t('subscribe.success.next_step_title')}
            </h3>
            <p className="text-purple-200 text-sm">
              {t('subscribe.success.next_step_message')}
            </p>
          </div>
          
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-200"
          >
            {t('subscribe.success.continue_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeSuccessPage;
