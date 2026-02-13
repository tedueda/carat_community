// Helper function to get clean origin without userinfo (user:pass@)
const getCleanOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  // Reconstruct origin without userinfo
  return `${url.protocol}//${url.host}`;
};

// For dev mode, use clean origin to avoid userinfo in fetch URLs
// For production, use the configured API URL
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? getCleanOrigin() : '');
export const DIRECT_API_URL = 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com';
export const BACKEND_URL = import.meta.env.VITE_API_URL || DIRECT_API_URL;
