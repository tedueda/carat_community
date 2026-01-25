import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X, Play, Trash2, Edit, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import PaidMemberUpgradeModal from '../PaidMemberUpgradeModal';

interface CourseImage {
  id: number;
  image_url: string;
  sort_order: number;
}

interface CourseVideo {
  id: number;
  youtube_url: string;
  youtube_video_id: string;
  sort_order: number;
}

interface Course {
  id: number;
  owner_user_id: number;
  title: string;
  description: string;
  category: string;
  price_label: string;
  external_url: string;
  instructor_profile: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  images: CourseImage[];
  videos: CourseVideo[];
  owner_display_name: string | null;
  owner_avatar_url: string | null;
}

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  business: 'ビジネス',
  creative: 'クリエイティブ',
  language: '語学',
  health: '健康',
  relationship: '恋愛・関係',
  life: 'ライフ',
  other: 'その他',
};

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isOwner = user?.id === course.owner_user_id;
  const isAdmin = user?.membership_type === 'admin';
  const isPaidUser = user?.membership_type === 'premium' || user?.membership_type === 'admin';
  const canEdit = isOwner || isAdmin;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? course.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === course.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
    setShowVideoModal(true);
  };

  const handleDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/${course.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        onDelete();
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isPaidUser) {
      setShowUpgradeModal(true);
      return;
    }

    setContactLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/${course.id}/contact`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chat_id) {
          // 既存のチャットがある場合
          navigate(`/matching/chats/${data.chat_id}`);
        } else if (data.status === 'pending') {
          // リクエスト送信済み
          alert('問い合わせを送信しました。相手からの返信をお待ちください。');
          navigate('/matching/chats');
        } else if (data.status === 'accepted') {
          // 承認済み
          navigate('/matching/chats');
        } else {
          alert('問い合わせを送信しました。');
          navigate('/matching/chats');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'チャットの開始に失敗しました');
      }
    } catch (error) {
      console.error('チャット開始エラー:', error);
      alert('エラーが発生しました');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          一覧に戻る
        </button>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              編集
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              削除
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

      {/* Image Slider */}
      {course.images.length > 0 ? (
        <div className="relative mb-6">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={course.images[currentImageIndex].image_url}
              alt={`${course.title} - 画像 ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          {course.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                aria-label="前の画像"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                aria-label="次の画像"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {course.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`画像 ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6">
          <span className="text-6xl">📚</span>
        </div>
      )}

      {/* Video Thumbnails */}
      {course.videos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">デモ動画</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {course.videos.map((video) => (
              <button
                key={video.id}
                onClick={() => handleVideoClick(video.youtube_video_id)}
                className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
                  alt="動画サムネイル"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
          {CATEGORY_LABELS[course.category] || course.category}
        </span>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">講座の説明</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">講座料金</h2>
        <p className="text-2xl font-bold text-gray-900">{course.price_label}</p>
      </div>

      {/* Instructor Profile */}
      {course.instructor_profile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">講師プロフィール</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{course.instructor_profile}</p>
        </div>
      )}

      {/* Instructor Info (会員限定でプロフィールリンク) */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">投稿者</h2>
        {user ? (
          <button
            onClick={() => navigate(`/matching/users/${course.owner_user_id}`)}
            className="flex items-center gap-3 hover:bg-gray-100 p-2 -m-2 rounded-lg transition-colors w-full text-left"
          >
            {course.owner_avatar_url ? (
              <img
                src={course.owner_avatar_url}
                alt={course.owner_display_name || ''}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {course.owner_display_name || '匿名'}
              </p>
              <p className="text-sm text-blue-600">プロフィールを見る →</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {course.owner_avatar_url ? (
              <img
                src={course.owner_avatar_url}
                alt={course.owner_display_name || ''}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {course.owner_display_name || '匿名'}
              </p>
              <p className="text-sm text-gray-500">プロフィールは会員限定</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200 space-y-3">
        {/* 投稿者に問い合わせボタン（自分の講座以外で表示） */}
        {!isOwner && (
          <button
            onClick={handleContact}
            disabled={contactLoading}
            className="flex items-center justify-center gap-2 w-full py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium text-lg disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5" />
            {contactLoading ? '接続中...' : '投稿者に問い合わせる'}
          </button>
        )}
        {/* 講座サイトで申し込むボタン（有料会員のみ） */}
        {isPaidUser ? (
          <a
            href={course.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-lg hover:bg-gray-800 font-medium text-lg"
          >
            <ExternalLink className="w-5 h-5" />
            サイトから申し込む
          </a>
        ) : (
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
              } else {
                setShowUpgradeModal(true);
              }
            }}
            className="flex items-center justify-center gap-2 w-full py-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium text-lg"
          >
            <ExternalLink className="w-5 h-5" />
            サイトから申し込む（有料会員限定）
          </button>
        )}
      </div>

      {/* Upgrade Modal */}
      <PaidMemberUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="投稿者への問い合わせ"
      />

      {/* Video Modal */}
      {showVideoModal && selectedVideoId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              aria-label="閉じる"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                title="YouTube video"
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">講座を削除しますか？</h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。講座に関連するすべてのデータが削除されます。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={deleting}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
