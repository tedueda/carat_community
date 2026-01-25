import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Heart, MessageCircle, ArrowLeft, Plus, Calendar, User } from 'lucide-react';
import { Post } from '../types/Post';

const BlogListPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        post_type: 'blog',
        status: 'published',
        sort: 'newest',
      });
      
      const response = await fetch(
        `${API_URL}/api/posts?${params}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [token]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/feed')}
            className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-pink-800">ブログ</h1>
            <p className="text-slate-600">コミュニティメンバーの記事</p>
          </div>
        </div>

        {user && user.email !== 'anonymous@example.com' && (
          <Button 
            onClick={() => navigate('/create/blog')}
            className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            ブログを書く
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-2xl border-pink-100">
              <CardContent className="p-6 space-y-4">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <Card className="text-center p-12 border-pink-200">
          <CardContent>
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              まだブログ記事がありません
            </h3>
            <p className="text-gray-500 mb-6">
              最初のブログを書いて、あなたのストーリーを共有しましょう！
            </p>
            {user && user.email !== 'anonymous@example.com' && (
              <Button 
                onClick={() => navigate('/create/blog')}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                最初のブログを書く
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <Card 
              key={blog.id}
              className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-pink-100"
              onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
            >
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-pink-600 transition-colors">
                  {blog.title || 'Untitled'}
                </h2>
                
                {blog.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{blog.user_display_name || 'ユーザー'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className={`h-4 w-4 ${blog.is_liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                    {blog.like_count || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {blog.comment_count || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
