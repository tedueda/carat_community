// Helper function to get clean origin without userinfo (user:pass@)
const getCleanOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  // Reconstruct origin without userinfo
  return `${url.protocol}//${url.host}`;
};

// API URL configuration
// - Development: uses proxy through Vite dev server (same origin)
// - Production: MUST be set via VITE_API_URL environment variable in Netlify
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? getCleanOrigin() : '');

// Validate that API_URL is set in production builds
if (!import.meta.env.VITE_API_URL && !import.meta.env.DEV) {
  console.error(
    '[CONFIG ERROR] VITE_API_URL environment variable is not set!\n' +
    'Please configure VITE_API_URL in Netlify dashboard:\n' +
    'Site settings > Build & deploy > Environment > Environment variables'
  );
}
