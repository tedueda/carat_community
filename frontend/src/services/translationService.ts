/**
 * Translation service for fetching translated posts
 */

import { PostWithTranslation } from '../types/Post';
import { getPreferredLanguage, SupportedLanguage } from '../utils/languageUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com';

export interface TranslationResponse {
  post: PostWithTranslation;
  error?: string;
}

/**
 * Fetch a post with translation
 */
export async function fetchPostWithTranslation(
  postId: number,
  lang?: SupportedLanguage,
  mode: 'translated' | 'original' = 'translated'
): Promise<PostWithTranslation> {
  const targetLang = lang || getPreferredLanguage();
  
  const url = new URL(`${API_BASE_URL}/api/posts/${postId}/translated`);
  url.searchParams.set('lang', targetLang);
  url.searchParams.set('mode', mode);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': navigator.language || 'ja',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch translated post: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get supported languages from the API
 */
export async function fetchSupportedLanguages(): Promise<{
  supported_languages: string[];
  default_language: string;
  language_names: Record<string, string>;
}> {
  const response = await fetch(`${API_BASE_URL}/api/posts/languages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch supported languages: ${response.status}`);
  }
  
  return response.json();
}
