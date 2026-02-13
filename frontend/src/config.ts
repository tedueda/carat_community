// Primary: same-origin proxy via Netlify _redirects (or vite dev proxy)
// Fallback: direct backend URL if proxy fails
export const API_URL = import.meta.env.VITE_API_URL || '';
export const DIRECT_API_URL = 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com';

console.log('API_URL configured as:', API_URL || '(same origin proxy)');
