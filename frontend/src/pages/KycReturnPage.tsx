import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

const KycReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [status, setStatus] = useState<'checking' | 'verified' | 'failed' | 'timeout'>('checking');
  const [message, setMessage] = useState('本人確認結果を確認中...');
  const maxPolls = 15; // 30 seconds (2 second intervals)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_currentPoll, setCurrentPoll] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const checkKycStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/kyc/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.kyc_status === 'verified') {
            setStatus('verified');
            setMessage('本人確認が完了しました！');
            
            // Redirect to subscribe page after 2 seconds
            setTimeout(() => {
              navigate('/subscribe');
            }, 2000);
            return true;
          } else if (data.kyc_status === 'failed') {
            setStatus('failed');
            setMessage('本人確認に失敗しました。もう一度お試しください。');
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking KYC status:', error);
        return false;
      }
    };

    // Initial check
    checkKycStatus();

    // Poll every 2 seconds
    const pollInterval = setInterval(async () => {
      setCurrentPoll(prev => {
        const newCount = prev + 1;
        
        if (newCount >= maxPolls) {
          clearInterval(pollInterval);
          setStatus('timeout');
          setMessage('本人確認の処理に時間がかかっています。しばらくしてから再度お試しください。');
          return newCount;
        }
        
        return newCount;
      });

      const completed = await checkKycStatus();
      if (completed) {
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [token, navigate]);

  const handleRetry = async () => {
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
        if (data.url) {
          window.location.assign(data.url);
        }
      } else {
        const error = await response.json();
        alert(error.detail || '本人確認の開始に失敗しました。');
      }
    } catch (error) {
      console.error('Error starting KYC:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === 'checking' && (
            <>
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                本人確認を処理中
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-150"></div>
              </div>
            </>
          )}

          {status === 'verified' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                本人確認完了
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                サブスクリプションページに移動します...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                本人確認失敗
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={handleRetry}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                再試行
              </button>
            </>
          )}

          {status === 'timeout' && (
            <>
              <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                処理中
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  再試行
                </button>
                <button
                  onClick={() => navigate('/account')}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  アカウントページに戻る
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycReturnPage;
