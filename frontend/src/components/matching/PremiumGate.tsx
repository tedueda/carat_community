import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/contexts/AuthContext';
import MatchingGateModal from './MatchingGateModal';

interface PremiumGateProps {
  children: React.ReactNode;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ children }) => {
  const { isPremium, loading } = usePremium();
  const { isAnonymous } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleUpgrade = async () => {
    try {
      // FE側の簡易呼び出し。実装側でStripe CheckoutのURLを返す想定
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (_) {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]">Loading...</div>;
  }

  if (!isPremium || isAnonymous) {
    return (
      <>
        <MatchingGateModal open={true} onClose={handleClose} onUpgrade={handleUpgrade} />
        <div aria-hidden className="pointer-events-none select-none opacity-40">
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default PremiumGate;
