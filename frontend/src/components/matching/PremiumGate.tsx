import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumGateProps {
  children: React.ReactNode;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]">Loading...</div>;
  }

  // All users (including anonymous) can view the matching list
  // Login/Premium checks are done at the individual action level (like, chat, profile detail)
  return <>{children}</>;
};

export default PremiumGate;
