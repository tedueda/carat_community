import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 有料会員ステータスを取得するフック
 * @returns { loading, isPaidUser, isPremium (deprecated), refresh }
 */
export function usePaidMember() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const evaluateFallback = useCallback(() => {
    return (user as any)?.premium_status === true || (user as any)?.membership_type === 'premium';
  }, [user]);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      if (!token) {
        setIsPaidUser(false);
        return false;
      }
      const res = await fetch(`${API_URL}/api/billing/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsPaidUser(!!data?.premium);
        return !!data?.premium;
      } else {
        const fb = evaluateFallback();
        setIsPaidUser(fb);
        return fb;
      }
    } catch (_) {
      const fb = evaluateFallback();
      setIsPaidUser(fb);
      return fb;
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, evaluateFallback]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const url = new URL(window.location.href);
      const from = url.searchParams.get('from');
      await fetchStatus();
      if (from === 'checkout') {
        // 直後に再取得して即時反映
        await fetchStatus();
        // クエリ除去（履歴は残す）
        url.searchParams.delete('from');
        window.history.replaceState({}, '', url.toString());
      }
      if (cancelled) return;
    };
    init();
    return () => { cancelled = true; };
  }, [fetchStatus]);

  const refresh = useMemo(() => fetchStatus, [fetchStatus]);

  return { 
    loading, 
    /** 有料会員かどうか */
    isPaidUser, 
    /** @deprecated isPaidUser を使用してください */
    isPremium: isPaidUser,
    refresh 
  };
}

/** @deprecated usePaidMember を使用してください */
export function usePremium() {
  return usePaidMember();
}
