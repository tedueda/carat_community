import React, { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../config';

interface Category {
  id: string;
  name: string;
}

interface ArtSaleItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  technique: string | null;
  size: string | null;
  year_created: number | null;
  is_original: boolean;
  transaction_method: string;
  status: string;
  images: { id: number; image_url: string; display_order: number }[];
}

interface ArtSalePostFormProps {
  categories: Category[];
  editingItem?: ArtSaleItem | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  painting: '絵画',
  sculpture: '彫刻',
  digital: 'デジタルアート',
  photography: '写真',
  calligraphy: '書道',
  crafts: '工芸',
  illustration: 'イラスト',
  other: 'その他',
};

const ArtSalePostForm: React.FC<ArtSalePostFormProps> = ({
  categories,
  editingItem,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');

  const [title, setTitle] = useState(editingItem?.title || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [price, setPrice] = useState(editingItem?.price?.toString() || '');
  const [category, setCategory] = useState(editingItem?.category || '');
  const [technique, setTechnique] = useState(editingItem?.technique || '');
  const [size, setSize] = useState(editingItem?.size || '');
  const [yearCreated, setYearCreated] = useState(editingItem?.year_created?.toString() || '');
  const [isOriginal, setIsOriginal] = useState(editingItem?.is_original ?? true);
  const [transactionMethod, setTransactionMethod] = useState(editingItem?.transaction_method || 'negotiable');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    editingItem?.images?.map(img => img.image_url) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('artSales.form.errors.titleRequired'));
      return;
    }
    if (!description.trim()) {
      setError(t('artSales.form.errors.descriptionRequired'));
      return;
    }
    if (!category) {
      setError(t('artSales.form.errors.categoryRequired'));
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls: string[] = [...existingImages];

      for (const image of images) {
        const formData = new FormData();
        formData.append('file', image);

        try {
          const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            uploadedUrls.push(uploadData.url);
          }
        } catch (uploadError) {
          console.error('画像アップロードエラー:', uploadError);
        }
      }

      const itemData = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price) || 0,
        category,
        technique: technique.trim() || null,
        size: size.trim() || null,
        year_created: yearCreated ? parseInt(yearCreated) : null,
        is_original: isOriginal,
        transaction_method: transactionMethod,
        image_urls: uploadedUrls,
      };

      const url = editingItem
        ? `${API_URL}/api/art-sales/items/${editingItem.id}`
        : `${API_URL}/api/art-sales/items`;

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || t('artSales.form.errors.submitFailed'));
      }
    } catch (err) {
      console.error('出品エラー:', err);
      setError(t('artSales.form.errors.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingItem ? t('artSales.form.editTitle') : t('artSales.form.createTitle')}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('artSales.form.images')}
            </label>
            
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative w-20 h-20">
                    <img
                      src={url}
                      alt={`既存画像 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      aria-label="画像を削除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((file, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`新規画像 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      aria-label="画像を削除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {existingImages.length + images.length < 5 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">{t('artSales.form.clickToAddImage')}</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('artSales.form.title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder={t('artSales.form.titlePlaceholder')}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('artSales.form.description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 h-32"
              placeholder={t('artSales.form.descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('artSales.form.price')}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder={t('artSales.form.pricePlaceholder')}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('artSales.form.category')} <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label={t('artSales.form.categoryLabel')}
              >
                <option value="">{t('common.pleaseSelect')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {t(`artSales.categories.${cat.id}`, { defaultValue: CATEGORY_LABELS[cat.id] || cat.name })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('artSales.form.technique')}
              </label>
              <input
                type="text"
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder={t('artSales.form.techniquePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('artSales.form.size')}
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder={t('artSales.form.sizePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('artSales.form.yearCreated')}
              </label>
              <input
                type="number"
                value={yearCreated}
                onChange={(e) => setYearCreated(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('artSales.form.transactionMethod')}
              </label>
              <select
                value={transactionMethod}
                onChange={(e) => setTransactionMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label={t('artSales.form.transactionMethodLabel')}
              >
                <option value="negotiable">{t('artSales.transactionMethods.negotiable')}</option>
                <option value="hand_off">{t('artSales.transactionMethods.hand_off')}</option>
                <option value="shipping">{t('artSales.transactionMethods.shipping')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOriginal}
                onChange={(e) => setIsOriginal(e.target.checked)}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('artSales.form.isOriginal')}</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.processing') : editingItem ? t('common.update') : t('artSales.form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtSalePostForm;
