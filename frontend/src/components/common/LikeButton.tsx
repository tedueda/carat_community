import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiamondIcon } from 'lucide-react';

const globalLock = new Set<number>();

interface LikeButtonProps {
  postId: number;
  initialLiked: boolean;
  initialLikeCount: number;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
  token: string | null;
  apiUrl: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  source?: string; // For debugging: "modal", "card", etc.
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLiked,
  initialLikeCount,
  onLikeChange,
  token,
  apiUrl,
  className = '',
  size = 'sm',
  source = 'unknown'
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    console.log(`[LikeButton] Click detected - postId: ${postId}, source: ${source}, timestamp: ${Date.now()}`);

    if (!token) {
      alert('カラットするには会員登録が必要です');
      window.location.href = '/login';
      return;
    }

    if (globalLock.has(postId)) {
      console.log(`[LikeButton] Blocked by global lock - postId: ${postId}, source: ${source}`);
      return;
    }

    globalLock.add(postId);
    setIsDisabled(true);

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    const nextIsLiked = !originalIsLiked;
    const nextLikeCount = Math.max(0, originalLikeCount + (nextIsLiked ? 1 : -1));
    setIsLiked(nextIsLiked);
    setLikeCount(nextLikeCount);

    try {
      const method = nextIsLiked ? 'PUT' : 'DELETE';
      console.log(`[LikeButton] Making API call - postId: ${postId}, source: ${source}, method: ${method}`);
      let response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 405 || response.status === 404) {
        console.log(`[LikeButton] ${method} not supported (${response.status}), falling back to POST toggle`);
        response = await fetch(`${apiUrl}/api/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.like_count);
        
        if (onLikeChange) {
          onLikeChange(data.liked, data.like_count);
        }
      } else {
        setIsLiked(originalIsLiked);
        setLikeCount(originalLikeCount);
        
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail === 'Cannot like your own post') {
          alert('自分の投稿にはカラットできません');
        } else {
          console.error('Failed to update like:', errorData);
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    } finally {
      globalLock.delete(postId);
      setIsDisabled(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={`flex items-center space-x-1 ${
        isLiked 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      } ${className}`}
    >
      <DiamondIcon 
        className={`h-4 w-4 ${isLiked ? 'fill-blue-600' : ''}`} 
      />
      <span>{likeCount}</span>
      <span className="hidden sm:inline">カラット</span>
    </Button>
  );
};

export default LikeButton;
