/**
 * Translation service for fetching translated posts, comments, and messages
 */

import { PostWithTranslation } from '../types/Post';
import { getPreferredLanguage, SupportedLanguage } from '../utils/languageUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com';

export interface TranslationResponse {
  post: PostWithTranslation;
  error?: string;
}

export interface CommentTranslationResponse {
  comment_id: number;
  original_text: string;
  translated_text: string;
  target_lang: string;
  is_translated: boolean;
  has_translation: boolean;
}

export interface MessageTranslationResponse {
  message_id: number;
  original_text: string;
  translated_text: string;
  target_lang: string;
  is_translated: boolean;
  has_translation: boolean;
}

export interface SalonMessageTranslationResponse {
  salon_message_id: number;
  original_text: string;
  translated_text: string;
  target_lang: string;
  is_translated: boolean;
  has_translation: boolean;
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
 * Fetch multiple posts with translation
 */
export async function fetchPostsWithTranslation(
  lang?: SupportedLanguage,
  category?: string,
  limit: number = 20,
  offset: number = 0
): Promise<PostWithTranslation[]> {
  const targetLang = lang || getPreferredLanguage();
  
  const url = new URL(`${API_BASE_URL}/api/translations/posts`);
  url.searchParams.set('lang', targetLang);
  if (category) {
    url.searchParams.set('category', category);
  }
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': navigator.language || 'ja',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch translated posts: ${response.status}`);
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
  const response = await fetch(`${API_BASE_URL}/api/languages`, {
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

/**
 * Fetch a comment with translation
 */
export async function fetchCommentWithTranslation(
  commentId: number,
  lang?: SupportedLanguage,
  mode: 'translated' | 'original' = 'translated'
): Promise<CommentTranslationResponse> {
  const targetLang = lang || getPreferredLanguage();
  
  const url = new URL(`${API_BASE_URL}/api/comments/${commentId}/translated`);
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
    throw new Error(`Failed to fetch translated comment: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch a message with translation
 */
export async function fetchMessageWithTranslation(
  messageId: number,
  lang?: SupportedLanguage,
  mode: 'translated' | 'original' = 'translated'
): Promise<MessageTranslationResponse> {
  const targetLang = lang || getPreferredLanguage();
  
  const url = new URL(`${API_BASE_URL}/api/messages/${messageId}/translated`);
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
    throw new Error(`Failed to fetch translated message: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch a salon message with translation
 */
export async function fetchSalonMessageWithTranslation(
  salonMessageId: number,
  lang?: SupportedLanguage,
  mode: 'translated' | 'original' = 'translated'
): Promise<SalonMessageTranslationResponse> {
  const targetLang = lang || getPreferredLanguage();
  
  const url = new URL(`${API_BASE_URL}/api/salon/messages/${salonMessageId}/translated`);
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
    throw new Error(`Failed to fetch translated salon message: ${response.status}`);
  }
  
  return response.json();
}
