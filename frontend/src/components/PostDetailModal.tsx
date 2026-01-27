import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Camera, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { Post, User, Comment, PostWithTranslation } from '../types/Post';
import LikeButton from './common/LikeButton';
import { compressImage } from '../utils/imageCompression';
import TranslationToggle from './common/TranslationToggle';
import { fetchPostWithTranslation } from '../services/translationService';
import { getPreferredLanguage } from '../utils/languageUtils';

interface PostDetailModalProps {
  post: Post;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updated: Post) => void;
  onDeleted?: (postId: number) => void;
  onEditInForm?: (post: Post) => void;
}


const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  user,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
  onEditInForm
}) => {
  const { token, user: currentUser, isAnonymous, isLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showFullText, setShowFullText] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editBody, setEditBody] = useState(post.body || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
    // Translation state
    const [translatedPost, setTranslatedPost] = useState<PostWithTranslation | null>(null);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [showTranslated, setShowTranslated] = useState<boolean>(true);
    const [viewLang, setViewLang] = useState<string>(getPreferredLanguage());

    const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '今';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const getCategoryPlaceholder = (category: string | undefined): string => {
    const categoryMap: { [key: string]: string } = {
      'board': '/assets/placeholders/board.svg',
      'art': '/assets/placeholders/art.svg',
      'music': '/assets/placeholders/music.svg',
      'shops': '/assets/placeholders/shops.svg',
      'tourism': '/assets/placeholders/tourism.svg',
      'comics': '/assets/placeholders/comics.svg',
    };
    return categoryMap[category || 'board'] || '/assets/placeholders/board.svg';
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      let videoId = '';
      
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname === 'youtu.be') {
        // Extract video ID from pathname, removing any query parameters
        const pathParts = urlObj.pathname.slice(1).split('?');
        videoId = pathParts[0];
      } else if (urlObj.hostname === 'm.youtube.com') {
        videoId = urlObj.searchParams.get('v') || '';
      }
      
      // Clean video ID by removing any remaining query parameters or slashes
      videoId = videoId.split('?')[0].split('&')[0].split('/')[0];
      
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        // Use youtube-nocookie.com for better privacy and compatibility
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    } catch (error) {
      console.error('Invalid YouTube URL:', error);
    }
    
    return '';
  };

  const extractYouTubeUrl = (text: string): string | null => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
    const match = text.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return null;
  };

    // Fetch translation for the post
    const fetchTranslation = async () => {
      if (!post) return;
    
      const userLang = getPreferredLanguage();
      setViewLang(userLang);
    
      // Skip translation if original language matches user's preferred language
      if (post.original_lang === userLang) {
        setTranslatedPost(null);
        setShowTranslated(false);
        return;
      }
    
      try {
        setIsTranslating(true);
        setTranslationError(null);
        const translated = await fetchPostWithTranslation(post.id, userLang, 'translated');
        setTranslatedPost(translated);
        setShowTranslated(translated.is_translated);
        console.log('[PostDetailModal] Translation fetched:', {
          original_lang: translated.original_lang,
          view_lang: translated.view_lang,
          is_translated: translated.is_translated,
          has_translation: translated.has_translation
        });
      } catch (error) {
        console.error('[PostDetailModal] Translation fetch error:', error);
        setTranslationError('翻訳の取得に失敗しました');
        setShowTranslated(false);
      } finally {
        setIsTranslating(false);
      }
    };

    const handleTranslationToggle = () => {
      setShowTranslated(!showTranslated);
    };

    // Get display content (translated or original)
    const displayTitle = showTranslated && translatedPost?.is_translated 
      ? translatedPost.display_title 
      : post.title;
  
    const displayBody = showTranslated && translatedPost?.is_translated 
      ? translatedPost.display_text 
      : post.body;

    const fetchComments = async () => {
      if (!post) return;
    
      try {
        const response = await fetch(`${API_URL}/api/posts/${post.id}/comments`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      } else {
        setComments([
          {
            id: 1,
            body: "素晴らしい投稿ですね！とても参考になりました。",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            user: { id: 2, display_name: "田中さん" }
          },
          {
            id: 2,
            body: "私も同じような経験があります。共感できる内容でした。",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            user: { id: 3, display_name: "佐藤さん" }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([
        {
          id: 1,
          body: "素晴らしい投稿ですね！とても参考になりました。",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user: { id: 2, display_name: "田中さん" }
        }
      ]);
    }
  };

  const getLinkHostname = (url: string): string | null => {
    try {
      if (!url) return null;
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return null;
    }
  };

  const extractFirstUrl = (text: string): string | null => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+)/;
    const match = text.match(urlRegex);
    return match ? match[1] : null;
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          authorName: currentUser?.display_name || 'Anonymous',
          body: newComment,
        }),
      });
      
      if (response.ok) {
        const newCommentData = await response.json();
        const updatedComments = [...comments, {
          ...newCommentData,
          user: { id: currentUser?.id || 0, display_name: currentUser?.display_name || 'あなた' }
        }];
        setComments(updatedComments);
        setNewComment('');
        
        // 親コンポーネントに通知（コメント数を更新）
        onUpdated?.({
          ...post,
          comment_count: updatedComments.length
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      const optimisticComment: Comment = {
        id: Date.now(),
        body: newComment,
        created_at: new Date().toISOString(),
        user: { id: currentUser?.id || 0, display_name: currentUser?.display_name || 'あなた' }
      };
      const updatedComments = [...comments, optimisticComment];
      setComments(updatedComments);
      setNewComment('');
      
      // 親コンポーネントに通知（コメント数を更新）
      onUpdated?.({
        ...post,
        comment_count: updatedComments.length
      });
    }
  };


  // Placeholder for future gallery navigation
  // const nextImage = () => {};
  // const prevImage = () => {};

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        fetchComments();
        fetchTranslation();
        setIsLiked(post.is_liked || false);
        setLikeCount(post.like_count || 0);
        setShowFullText(false);
        setIsEditing(false);
        setIsDeleting(false);
        setEditTitle(post.title || '');
        setEditBody(post.body || '');
        setNewImageFile(null);
        setNewImagePreview(null);
        setRemoveCurrentImage(false);
        setUploadError(null);
        // Reset translation state
        setTranslatedPost(null);
        setTranslationError(null);
        console.debug('[PostDetailModal] open', {
          currentUserId: currentUser?.id,
          postUserId: post.user_id,
          isAnonymous
        });
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          const modal = modalRef.current;
          if (!modal) return;
          
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, post.id, onClose]);

  // Normalize IDs to numbers to avoid strict equality issues (API may return strings)
  const currentUserId = currentUser?.id != null ? Number(currentUser.id) : null;
  const postAuthorId = post?.user_id != null ? Number(post.user_id) : null;
  const canEdit = !isLoading && !!currentUser && !isAnonymous && currentUserId != null && postAuthorId != null && currentUserId === postAuthorId;
  const linkUrlFromBody = extractFirstUrl(post.body || '');

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadError(null);
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('画像ファイルを選択してください');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('画像は10MB以下にしてください');
        return;
      }
      
      try {
        // 画像を自動圧縮
        setIsUploadingImage(true);
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeMB: 2,
        });
        
        setNewImageFile(compressedFile);
        setNewImagePreview(URL.createObjectURL(compressedFile));
        setRemoveCurrentImage(false);
        
        // 圧縮結果を表示
        const originalSizeKB = (file.size / 1024).toFixed(0);
        const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);
        console.log(`📸 画像を圧縮しました: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
      } catch (error) {
        console.error('画像圧縮エラー:', error);
        setUploadError('画像の処理に失敗しました');
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      setNewImageFile(null);
      setNewImagePreview(null);
    }
  };

  const handleRemoveImageToggle = () => {
    setRemoveCurrentImage((prev) => !prev);
    if (!removeCurrentImage) {
      // when marking for removal, clear new selection if any
      setNewImageFile(null);
      setNewImagePreview(null);
    }
  };

  const uploadNewImageIfNeeded = async (): Promise<{ mediaId: number | null, mediaUrl?: string } | null> => {
    if (!token) return { mediaId: null };
    if (!newImageFile) return null; // no change
    try {
      setIsUploadingImage(true);
      const fd = new FormData();
      fd.append('file', newImageFile);
      
      // Add timeout to prevent indefinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      try {
        const res = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: fd,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          setUploadError(`画像アップロードに失敗しました (status ${res.status})`);
          console.error('[PostDetailModal] upload image failed', res.status, txt);
          return { mediaId: null };
        }
        const data = await res.json();
        return { mediaId: data.id, mediaUrl: data.url as string };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setUploadError('アップロードがタイムアウトしました。画像サイズを小さくしてください。');
          console.error('[PostDetailModal] upload timeout');
        } else {
          throw fetchError;
        }
        return { mediaId: null };
      }
    } catch (e: any) {
      setUploadError(e?.message || '画像アップロードに失敗しました');
      console.error('[PostDetailModal] upload image error', e);
      return { mediaId: null };
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!token) {
      console.warn('[PostDetailModal] No token, cannot update');
      return;
    }
    try {
      console.debug('[PostDetailModal] Updating post', { id: post.id, editTitle, editBody });
      let mediaIdToSet: number | null | undefined = undefined;
      let mediaUrlToSet: string | undefined = undefined;
      if (removeCurrentImage) {
        mediaIdToSet = null;
      } else {
        const uploaded = await uploadNewImageIfNeeded();
        if (uploaded && uploaded.mediaId) {
          mediaIdToSet = uploaded.mediaId;
          mediaUrlToSet = uploaded.mediaUrl;
        }
      }

      const response = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
          // include media_id only if changed
          ...(mediaIdToSet !== undefined ? { media_id: mediaIdToSet } : {}),
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        // complement response with media_url if we just uploaded or removed
        const patched = {
          ...updated,
          media_url: mediaUrlToSet !== undefined
            ? mediaUrlToSet
            : (removeCurrentImage ? undefined : (updated.media_url ?? post.media_url)),
        } as Post;
        onUpdated?.(patched);
        setIsEditing(false);
      } else {
        const text = await response.text();
        console.error('[PostDetailModal] Update failed', response.status, text);
      }
    } catch (e) {
      console.error('[PostDetailModal] Update error', e);
    }
  };

  const handleDeletePost = async () => {
    if (!token) {
      console.warn('[PostDetailModal] No token, cannot delete');
      return;
    }
    try {
      setIsDeleting(true);
      setDeleteError(null);
      console.debug('[PostDetailModal] Deleting post', { id: post.id });
      const response = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok || response.status === 204) {
        onDeleted?.(post.id);
        onClose();
      } else {
        let text = '';
        try {
          text = await response.text();
        } catch (_) {}
        console.error('[PostDetailModal] Delete failed', { status: response.status, text });
        setDeleteError(text || `削除に失敗しました (status ${response.status})`);
      }
    } catch (e: any) {
      console.error('[PostDetailModal] Delete error', e?.message || String(e));
      setDeleteError(e?.message || 'ネットワークエラーにより削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        ref={modalRef}
        className={`relative w-full bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'h-screen max-w-none rounded-none' 
            : 'max-w-3xl max-h-[90vh] mx-4 rounded-2xl'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.display_name?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <h3 id="modal-title" className="text-sm font-medium text-gray-900">
                {user?.display_name || 'テッドさん'}
              </h3>
              <p className="text-xs text-gray-500">
                {getRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-pink-700 border-pink-300 hover:bg-pink-50"
                      onClick={handleUpdatePost}
                      aria-label="保存"
                    >
                      保存
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(post.title || '');
                        setEditBody(post.body || '');
                      }}
                      aria-label="編集をやめる"
                    >
                      キャンセル
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-pink-700 hover:text-pink-900"
                      onClick={() => {
                        if (onEditInForm) {
                          onEditInForm(post);
                          onClose();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      aria-label="編集"
                    >
                      編集
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      aria-label="削除"
                    >
                      {isDeleting ? '削除中...' : '削除'}
                    </Button>
                  </>
                )}
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={isFullscreen ? '通常表示' : '全画面表示'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {deleteError && (
          <div className="mx-4 mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {deleteError}
          </div>
        )}

        {/* Dev-only debug banner to diagnose permission check */}
        {import.meta.env.DEV && (
          <div className="mb-2 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="font-semibold mb-1">[DEBUG] Permission state</div>
            <div className="flex flex-wrap gap-3">
              <span>currentUserId: {currentUserId ?? 'null'}</span>
              <span>postUserId: {postAuthorId}</span>
              <span>isAnonymous: {String(isAnonymous)}</span>
              <span>canEdit: {String(canEdit)}</span>
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {(post.media_url || (post.media_urls && post.media_urls.length > 0)) && (
            <div className="relative">
              <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                {isEditing ? (
                  <>
                    {/* Preview priority: new selected image > current image (unless marked for removal) */}
                    {newImagePreview ? (
                      <img
                        src={newImagePreview}
                        alt="新しい画像プレビュー"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : !removeCurrentImage ? (
                      <img
                        src={`${(() => {
                          const imageUrl = post.media_url || (post.media_urls && post.media_urls[currentImageIndex]);
                          if (!imageUrl) return '';
                          return imageUrl.startsWith('http') ? imageUrl : 
                                 (imageUrl.startsWith('/assets/') || imageUrl.startsWith('/images/')) ? imageUrl : 
                                 `${API_URL}${imageUrl}`;
                        })()}`}
                        alt="投稿画像"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        画像は削除されます
                      </div>
                    )}
                  </>
                ) : (
                  <img
                    src={`${(() => {
                      const imageUrl = post.media_url || (post.media_urls && post.media_urls[currentImageIndex]);
                      if (!imageUrl) return '';
                      return imageUrl.startsWith('http') ? imageUrl : 
                             (imageUrl.startsWith('/assets/') || imageUrl.startsWith('/images/')) ? imageUrl : 
                             `${API_URL}${imageUrl}`;
                    })()}`}
                    alt="投稿画像"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              
              {/* 複数画像のナビゲーションボタン */}
              {!isEditing && post.media_urls && post.media_urls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? post.media_urls!.length - 1 : prev - 1))}
                    aria-label="前の画像"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                    onClick={() => setCurrentImageIndex((prev) => (prev === post.media_urls!.length - 1 ? 0 : prev + 1))}
                    aria-label="次の画像"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {post.media_urls.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`画像${index + 1}を表示`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {(post.youtube_url || extractYouTubeUrl(post.body)) ? (
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(post.youtube_url || extractYouTubeUrl(post.body) || '')}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full rounded-lg"
              />
            </div>
          ) : !(post.media_url || (post.media_urls && post.media_urls[0])) && (
            <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
              <img
                src={getCategoryPlaceholder(post.category)}
                alt="カテゴリプレースホルダー"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          <div className="p-6">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-pink-200 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="タイトル"
                aria-label="タイトル編集"
              />
                        ) : (
                          displayTitle && (
                            <h2 className="text-xl font-bold text-gray-900 mb-3">{displayTitle}</h2>
                          )
                        )}

                        {/* Translation toggle */}
                        {!isEditing && (
                          <div className="mb-3">
                            <TranslationToggle
                              isTranslated={showTranslated && (translatedPost?.is_translated || false)}
                              isLoading={isTranslating}
                              hasTranslation={translatedPost?.has_translation || false}
                              originalLang={translatedPost?.original_lang || post.original_lang}
                              viewLang={viewLang}
                              onToggle={handleTranslationToggle}
                              error={translationError}
                            />
                          </div>
                        )}

                        {isEditing && (
              <div className="mb-4 space-y-2">
                <div className="text-sm font-medium text-gray-700">画像</div>
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor="edit-image" className="inline-flex items-center gap-2 px-3 py-2 border border-pink-300 rounded-md text-sm text-pink-700 hover:bg-pink-50 cursor-pointer">
                    📁 画像を選択
                  </label>
                  <input id="edit-image" type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  
                  <label htmlFor="edit-camera" className="inline-flex items-center gap-2 px-3 py-2 border border-blue-300 rounded-md text-sm text-blue-700 hover:bg-blue-50 cursor-pointer">
                    <Camera className="h-4 w-4" />
                    カメラで撮影
                  </label>
                  <input id="edit-camera" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageFileChange} />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`border-red-300 text-red-600 hover:bg-red-50 ${removeCurrentImage ? 'bg-red-50' : ''}`}
                    onClick={handleRemoveImageToggle}
                  >
                    {removeCurrentImage ? '画像削除を取り消す' : '画像を削除する'}
                  </Button>
                  {isUploadingImage && (
                    <span className="text-xs text-gray-500">画像処理中...</span>
                  )}
                  {uploadError && (
                    <span className="text-xs text-red-600">{uploadError}</span>
                  )}
                  {newImageFile && (
                    <span className="text-xs text-gray-500">
                      選択中: {newImageFile.name} ({(newImageFile.size / 1024).toFixed(0)}KB)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {!isEditing && post.category === 'tourism' && (
              <div className="mb-4 space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">イベント情報</h4>
                {post.prefecture && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">開催地域:</span>
                    <span className="text-gray-800">{post.prefecture}</span>
                  </div>
                )}
                {post.event_date && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">開催日:</span>
                    <span className="text-gray-800">{new Date(post.event_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {post.fee && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[80px]">会費:</span>
                    <span className="text-gray-800">{post.fee}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 min-w-[80px]">連絡先:</span>
                  <a 
                    href={`/profile/${post.user_id}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    投稿者のプロフィールを見る
                  </a>
                </div>
              </div>
            )}

            <div className="text-gray-700 leading-7 mb-4">
              {isEditing ? (
                <Textarea
                  placeholder="本文を入力..."
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="border-pink-200 focus:border-pink-400 min-h-[140px]"
                  rows={6}
                  aria-label="本文編集"
                />
                            ) : (
                              <>
                                {showFullText || displayBody.length <= 500 
                                  ? displayBody 
                                  : `${displayBody.substring(0, 500)}...`
                                }
                                {displayBody.length > 500 && (
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-pink-600 hover:text-pink-700 ml-2"
                                    onClick={() => setShowFullText(!showFullText)}
                                  >
                                    {showFullText ? '折りたたむ' : 'もっと見る'}
                                  </Button>
                                )}
                              </>
                            )}
            </div>

            {!isEditing && linkUrlFromBody && getLinkHostname(linkUrlFromBody) && (
              <div className="mb-4 flex items-center gap-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${getLinkHostname(linkUrlFromBody)}`}
                  alt="サイトアイコン"
                  className="w-5 h-5 rounded"
                />
                <a
                  href={linkUrlFromBody}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-gray-800 truncate"
                >
                  {getLinkHostname(linkUrlFromBody)} を開く
                </a>
              </div>
            )}

            <div className="flex items-center gap-6 py-4 border-t border-gray-100">
              <LikeButton
                postId={post.id}
                initialLiked={isLiked}
                initialLikeCount={likeCount}
                onLikeChange={(liked, count) => {
                  setIsLiked(liked);
                  setLikeCount(count);
                  onUpdated?.({
                    ...post,
                    is_liked: liked,
                    like_count: count
                  });
                }}
                token={token}
                apiUrl={API_URL}
                size="default"
                className="text-base"
                source="modal"
              />
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">コメント数 {formatNumber(comments.length)}</span>
              </div>
              {post.points && (
                <div className="text-sm font-medium text-orange-600">
                  {formatNumber(post.points)}pt
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                コメント ({formatNumber(comments.length)})
              </h4>

              {currentUser && !isAnonymous ? (
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 font-semibold text-sm">
                        {currentUser.display_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="コメントを入力..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="border-pink-200 focus:border-pink-400 min-h-[80px] resize-none"
                        rows={3}
                        aria-label="コメント入力"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {newComment.length}/1000文字
                        </p>
                        <Button 
                          onClick={handleAddComment}
                          size="sm"
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                          disabled={!newComment.trim() || newComment.length > 1000}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          送信
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg mb-6">
                  <p className="text-sm text-gray-500 mb-3">
                    コメントするにはログインが必要です
                  </p>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                    onClick={() => window.location.href = '/login'}
                  >
                    ログイン
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">最初のコメントを書きましょう</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-600 font-semibold text-sm">
                          {comment.user?.display_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.user?.display_name || '不明なユーザー'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comment.body}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-500 hover:text-pink-600 p-0 h-auto"
                          >
                            返信
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {comments.length > 0 && (
                  <div className="text-center py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      さらに表示
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
