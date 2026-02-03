import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, X, Video, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

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

interface Category {
  id: string;
  name: string;
}

interface CoursePostFormProps {
  course: Course | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const MAX_IMAGES = 5;
const MAX_VIDEOS = 6;

const CoursePostForm: React.FC<CoursePostFormProps> = ({ course, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const isEditing = !!course;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [category, setCategory] = useState(course?.category || '');
  const [priceLabel, setPriceLabel] = useState(course?.price_label || '');
  const [externalUrl, setExternalUrl] = useState(course?.external_url || '');
  const [imageUrls, setImageUrls] = useState<string[]>(
    course?.images.map((img) => img.image_url) || []
  );
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(
    course?.videos.map((vid) => vid.youtube_url) || []
  );
  const [instructorProfile, setInstructorProfile] = useState(course?.instructor_profile || '');

  // New URL inputs
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  
  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (imageUrls.length >= MAX_IMAGES) {
      setError(t('courses.form.maxImagesError', { max: MAX_IMAGES }));
      return;
    }

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('courses.form.invalidImageFormat'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t('courses.form.fileSizeError'));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrls([...imageUrls, data.url]);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || t('courses.form.uploadFailed'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(t('courses.form.uploadFailed'));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddVideo = () => {
    if (!newYoutubeUrl.trim()) return;
    if (youtubeUrls.length >= MAX_VIDEOS) {
      setError(t('courses.form.maxVideosError', { max: MAX_VIDEOS }));
      return;
    }
    // Basic YouTube URL validation
    if (!newYoutubeUrl.includes('youtube.com') && !newYoutubeUrl.includes('youtu.be')) {
      setError(t('courses.form.invalidYoutubeUrl'));
      return;
    }
    setYoutubeUrls([...youtubeUrls, newYoutubeUrl.trim()]);
    setNewYoutubeUrl('');
    setError(null);
  };

  const handleRemoveVideo = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError(t('courses.form.titleRequired'));
      return;
    }
    if (title.length > 80) {
      setError(t('courses.form.titleMaxLength'));
      return;
    }
    if (!description.trim()) {
      setError(t('courses.form.descriptionRequired'));
      return;
    }
    if (description.length > 3000) {
      setError(t('courses.form.descriptionMaxLength'));
      return;
    }
    if (!category) {
      setError(t('courses.form.categoryRequired'));
      return;
    }
    if (!priceLabel.trim()) {
      setError(t('courses.form.priceRequired'));
      return;
    }
    if (!externalUrl.trim()) {
      setError(t('courses.form.urlRequired'));
      return;
    }
    if (!externalUrl.startsWith('http://') && !externalUrl.startsWith('https://')) {
      setError(t('courses.form.invalidUrl'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        price_label: priceLabel.trim(),
        external_url: externalUrl.trim(),
        instructor_profile: instructorProfile.trim() || null,
        image_urls: imageUrls,
        youtube_urls: youtubeUrls,
      };

      const url = isEditing
        ? `${API_URL}/api/courses/${course.id}`
        : `${API_URL}/api/courses`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.detail || t('courses.form.saveFailed'));
      }
    } catch (error) {
      console.error('Save error:', error);
      setError(t('courses.form.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? t('courses.form.editTitle') : t('courses.form.createTitle')}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.category')} <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
            aria-label={t('courses.form.selectCategory')}
          >
            <option value="">{t('courses.form.selectCategoryPlaceholder')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {t(`courses.categories.${cat.id}`, { defaultValue: cat.name })}
              </option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.images', { max: MAX_IMAGES })}
          </label>
          <div className="space-y-3">
            {/* Uploaded images preview */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`画像 ${index + 1}`}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={t('courses.form.removeImage')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Upload button */}
            {imageUrls.length < MAX_IMAGES && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="course-image-upload"
                />
                <label
                  htmlFor="course-image-upload"
                  className={`flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      <span className="text-gray-500">{t('courses.form.uploading')}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-500">{t('courses.form.uploadImage')}</span>
                    </>
                  )}
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  {t('courses.form.imageFormatInfo')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Videos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.videos', { max: MAX_VIDEOS })}
          </label>
          <div className="space-y-3">
            {youtubeUrls.map((url, index) => {
              const videoId = extractVideoId(url);
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {videoId && (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                        alt={t('courses.form.thumbnail')}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <Video className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label={t('courses.form.removeVideo')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
            {youtubeUrls.length < MAX_VIDEOS && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newYoutubeUrl}
                  onChange={(e) => setNewYoutubeUrl(e.target.value)}
                  placeholder={t('courses.form.youtubeUrlPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  aria-label={t('courses.form.addVideo')}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder={t('courses.form.titlePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">{title.length}/80{t('courses.form.characters')}</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={3000}
            rows={8}
            placeholder={t('courses.form.descriptionPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-sm text-gray-500">{description.length}/3000{t('courses.form.characters')}</p>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.price')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            placeholder={t('courses.form.pricePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('courses.form.priceInfo')}
          </p>
        </div>

        {/* External URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.externalUrl')} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder={t('courses.form.urlPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('courses.form.urlInfo')}
          </p>
        </div>

        {/* Instructor Profile (moved here for better visibility) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('courses.form.instructorProfile')}
          </label>
          <textarea
            value={instructorProfile}
            onChange={(e) => setInstructorProfile(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            rows={5}
            maxLength={1000}
            placeholder={t('courses.form.instructorProfilePlaceholder')}
          />
          <p className="mt-1 text-sm text-gray-500 text-right">
            {instructorProfile.length}/1000{t('courses.form.characters')}
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t('common.saving') : isEditing ? t('common.update') : t('courses.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoursePostForm;
