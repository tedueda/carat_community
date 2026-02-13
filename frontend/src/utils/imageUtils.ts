/**
 * 画像URLを解決するユーティリティ関数
 * バックエンドから返されるURLを適切な形式に変換します
 */

import { API_URL } from '../config';

/**
 * 画像URLを解決する
 * @param url - 元のURL（相対パスまたは絶対パス）
 * @returns 解決されたURL
 */
export const resolveImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  
  // 既に完全なURLの場合はそのまま返す
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // /images/ で始まる場合は静的ファイル（そのまま）
  if (url.startsWith('/images/')) {
    return url;
  }
  
  // /media/ や /matching-media/ で始まる場合はAPI_URLを付加
  if (url.startsWith('/media/') || url.startsWith('/matching-media/')) {
    return `${API_URL}${url}`;
  }
  
  // それ以外の場合もAPI_URLを付加
  return `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
};

/**
 * 複数の画像URLを解決する
 * @param urls - URLの配列
 * @returns 解決されたURLの配列
 */
export const resolveImageUrls = (urls: (string | undefined | null)[]): string[] => {
  return urls.map(resolveImageUrl).filter(url => url !== '');
};

/**
 * 投稿の画像URLを取得する
 * - media_url を最優先
 * - なければ media_urls の先頭
 * - それもなければ og_image_url
 * @param post - 投稿オブジェクト
 * @returns 解決された画像URL（存在しなければ空文字）
 */
export const getPostImageUrl = (post: { media_url?: string; media_urls?: string[] | null; og_image_url?: string }): string => {
  // デバッグログ
  console.log('getPostImageUrl:', { media_url: post.media_url, og_image_url: post.og_image_url });
  
  // media_urlが存在し、S3のURLまたは完全なURLの場合は優先
  if (post.media_url && (post.media_url.startsWith('http') || post.media_url.includes('s3.amazonaws.com'))) {
    console.log('Using media_url:', post.media_url);
    return post.media_url;
  }

  // media_urlがローカルパスの場合は解決
  if (post.media_url) {
    const resolved = resolveImageUrl(post.media_url);
    console.log('Resolved media_url:', resolved);
    return resolved;
  }

  // media_url が無く、media_urls がある場合は先頭を使用
  if (post.media_urls && post.media_urls.length > 0) {
    const first = post.media_urls[0];
    const resolved = resolveImageUrl(first || '');
    console.log('Using first media_urls entry:', first, 'resolved:', resolved);
    return resolved;
  }

  // og_image_urlが完全なURL（Unsplashなど）の場合は使用
  if (post.og_image_url && post.og_image_url.startsWith('http')) {
    console.log('Using og_image_url:', post.og_image_url);
    return post.og_image_url;
  }
  
  // 最後の手段としてog_image_urlを解決
  const resolved = resolveImageUrl(post.og_image_url);
  console.log('Resolved og_image_url:', resolved);
  return resolved;
};
