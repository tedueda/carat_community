import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, MoreHorizontal, Smile, Award } from 'lucide-react';

interface User {
  id: number;
  display_name: string;
  email: string;
}

interface Post {
  id: number;
  title?: string;
  body: string;
  user_id: number;
  visibility: string;
  created_at: string;
  like_count?: number;
  is_liked?: boolean;
}

const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user, isAnonymous } = useAuth();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchPosts = async () => {
    try {
      const headers: any = {};
      if (token && !isAnonymous) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/posts/`, {
        headers,
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);

        const userIds = [...new Set(postsData.map((post: Post) => post.user_id))];
        const usersData: { [key: number]: User } = {};
        
        for (const userId of userIds) {
          try {
            const userHeaders: any = {};
            if (token && !isAnonymous) {
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
        
        setUsers(usersData);
      } else {
        setError('投稿の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラー');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, isAnonymous]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="text-center text-gray-600">投稿を読み込み中...</div>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-800 mb-2">コミュニティフィード</h1>
        <p className="text-gray-600">あなたの想いを共有し、みんなとつながりましょう</p>
      </div>

      {posts.length === 0 ? (
        <Card className="text-center p-6 sm:p-8 border-pink-200 shadow-lg">
          <CardContent>
            <Heart className="h-12 sm:h-16 w-12 sm:w-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">まだ投稿がありません。</h3>
            <p className="text-gray-500 mb-4">コミュニティの投稿をお待ちください。</p>
            {user && !isAnonymous ? (
              <Button 
                onClick={() => window.location.href = '/create'}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                最初の投稿を作成
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                投稿するには有料会員登録
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
                      {users[post.user_id]?.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {users[post.user_id]?.display_name || '不明なユーザー'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-pink-50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {post.title && (
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
              )}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap text-sm sm:text-base">{post.body}</p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-3 border-t border-gray-100">
                {user && !isAnonymous ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('この機能は準備中です');
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 hover:bg-pink-50 text-xs sm:text-sm"
                    >
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>愛</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('この機能は準備中です');
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                    >
                      <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>応援</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('この機能は準備中です');
                      }}
                      className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
                    >
                      <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>尊敬</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>コメント</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>シェア</span>
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center py-2">
                    <p className="text-sm text-gray-500 mb-2">リアクションや投稿をするには有料会員登録が必要です</p>
                    <Button 
                      onClick={() => window.location.href = '/login'}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                    >
                      有料会員登録
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
