import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchPostsWithTranslation } from '../services/translationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, MoreHorizontal, Smile, Award, Globe, Loader2 } from 'lucide-react';

interface User {
  id: number;
  display_name: string;
  email: string;
}

interface TranslatedPost {
  id: number;
  title?: string;
  body: string;
  user_id: number;
  visibility: string;
  created_at: string;
  like_count?: number;
  is_liked?: boolean;
  display_title?: string;
  display_text?: string;
  is_translated?: boolean;
  has_translation?: boolean;
  original_lang?: string;
  view_lang?: string;
  user_display_name?: string;
}

const PostFeed: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<TranslatedPost[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const { token, user, isFreeUser } = useAuth();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchPosts = async (lang?: string) => {
    try {
      setTranslating(true);
      
      // Use the translation endpoint to get posts with translations
      const postsData = await fetchPostsWithTranslation(
        (lang || currentLanguage) as any,
        undefined,
        50,
        0
      );
      
      setPosts(postsData);

      // Fetch user data for posts that don't have user_display_name
      const userIds = [...new Set(postsData.filter((p: TranslatedPost) => !p.user_display_name).map((post: TranslatedPost) => post.user_id))];
      const usersData: { [key: number]: User } = { ...users };
      
      for (const userId of userIds) {
        if (!usersData[userId as number]) {
          try {
            const userHeaders: any = {};
            if (token && !isFreeUser) {
              userHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const userResponse = await fetch(`${API_URL}/api/users/${userId}`, {
              headers: userHeaders,
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              usersData[userId as number] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
      }
      
      setUsers(usersData);
      setError('');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
      setTranslating(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts(currentLanguage);
  }, [user, isFreeUser]);

  // Re-fetch when language changes
  useEffect(() => {
    if (!loading) {
      fetchPosts(currentLanguage);
    }
  }, [currentLanguage]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">{t('post.loadingPosts')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-800 mb-2">{t('common.communityFeed')}</h1>
        <p className="text-gray-600">{t('common.shareYourThoughts')}</p>
        {translating && (
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('translation.translating')}</span>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="text-center p-6 sm:p-8 border-pink-200 shadow-lg">
          <CardContent>
            <Heart className="h-12 sm:h-16 w-12 sm:w-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">{t('post.noPostsYet')}</h3>
            <p className="text-gray-500 mb-4">{t('common.waitForPosts')}</p>
            {user && !isFreeUser ? (
              <Button 
                onClick={() => window.location.href = '/create'}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                {t('common.createFirstPost')}
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                {t('common.registerToPaidMember')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow border-pink-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-100 to-green-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-semibold text-sm sm:text-base">
                      {(post.user_display_name || users[post.user_id]?.display_name)?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {post.user_display_name || users[post.user_id]?.display_name || t('common.unknownUser')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </p>
                      {post.is_translated && (
                        <span className="flex items-center gap-1 text-xs text-blue-500">
                          <Globe className="h-3 w-3" />
                          {t('translation.autoTranslated')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-pink-50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(post.display_title || post.title) && (
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{post.display_title || post.title}</h2>
              )}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap text-sm sm:text-base">{post.display_text || post.body}</p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-3 border-t border-gray-100">
                {user && !isFreeUser ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(t('common.featureInProgress'));
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 hover:bg-pink-50 text-xs sm:text-sm"
                    >
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{t('common.love')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(t('common.featureInProgress'));
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                    >
                      <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{t('common.support')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(t('common.featureInProgress'));
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
                    >
                      <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{t('common.respect')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{t('post.comments')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{t('post.share')}</span>
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center py-2">
                    <p className="text-sm text-gray-500 mb-2">{t('common.paidMemberRequired')}</p>
                    <Button 
                      onClick={() => window.location.href = '/login'}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                    >
                      {t('common.paidMemberRegister')}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PostFeed;
