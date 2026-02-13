// Production backend URL
const PRODUCTION_API_URL = 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com';

// Helper function to get clean origin without userinfo (user:pass@)
const getCleanOrigin = (): string => {
  if (typeof window === 'undefined') return PRODUCTION_API_URL;
  const url = new URL(window.location.href);
  // Reconstruct origin without userinfo
  return `${url.protocol}//${url.host}`;
};

// For dev mode, use clean origin to avoid userinfo in fetch URLs
// For production, use the configured API URL or fallback
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? getCleanOrigin() : PRODUCTION_API_URL);

if (!import.meta.env.VITE_API_URL && !import.meta.env.DEV) {
  console.warn('VITE_API_URL is not set, using fallback backend URL:', PRODUCTION_API_URL);
}
