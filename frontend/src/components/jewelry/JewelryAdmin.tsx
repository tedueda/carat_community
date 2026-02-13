import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

interface JewelryProduct {
  id: number;
  product_code?: string;
  name: string;
  description: string;
  material?: string;
  size?: string;
  additional_info?: string;
  price: number;
  shipping_fee: number;
  price_includes_tax: boolean;
  stock: number;
  is_active: boolean;
  category: string;
  has_certificate: boolean;
  has_gem_id: boolean;
  is_sold_out: boolean;
  images: { id: number; image_url: string; display_order: number }[];
  created_at: string;
}

const JEWELRY_CATEGORIES = [
  { id: 'earring', name: 'イヤリング・ピアス' },
  { id: 'necklace', name: 'ネックレス' },
  { id: 'bracelet', name: 'ブレスレット' },
  { id: 'brooch', name: 'ブローチ' },
  { id: 'ring', name: 'リング' },
  { id: 'other', name: 'その他' },
];

const getCategoryName = (categoryId: string) => {
  const category = JEWELRY_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
};

interface ProductFormData {
  product_code: string;
  name: string;
  description: string;
  material: string;
  size: string;
  additional_info: string;
  price: number;
  shipping_fee: number;
  price_includes_tax: boolean;
  stock: number;
  category: string;
  has_certificate: boolean;
  has_gem_id: boolean;
  is_sold_out: boolean;
  image_urls: string[];
}


const JewelryAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<JewelryProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    product_code: '',
    name: '',
    description: '',
    material: '',
    size: '',
    additional_info: '',
    price: 0,
    shipping_fee: 0,
    price_includes_tax: true,
    stock: 0,
    category: 'other',
    has_certificate: false,
    has_gem_id: false,
    is_sold_out: false,
    image_urls: [],
  });
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/jewelry/products?limit=100`);
      if (!response.ok) throw new Error('商品の取得に失敗しました');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '商品の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({
      product_code: '',
      name: '',
      description: '',
      material: '',
      size: '',
      additional_info: '',
      price: 0,
      shipping_fee: 0,
      price_includes_tax: true,
      stock: 0,
      category: 'other',
      has_certificate: false,
      has_gem_id: false,
      is_sold_out: false,
      image_urls: [],
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: JewelryProduct) => {
    setEditingProduct(product);
    setFormData({
      product_code: product.product_code || '',
      name: product.name,
      description: product.description,
      material: product.material || '',
      size: product.size || '',
      additional_info: product.additional_info || '',
      price: product.price,
      shipping_fee: product.shipping_fee || 0,
      price_includes_tax: product.price_includes_tax,
      stock: product.stock,
      category: product.category || 'other',
      has_certificate: product.has_certificate || false,
      has_gem_id: product.has_gem_id || false,
      is_sold_out: product.is_sold_out || false,
      image_urls: product.images.length > 0 
        ? product.images.map(img => img.image_url) 
        : [],
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('この商品を削除しますか？')) return;

    const token = getAuthToken();
    if (!token) {
      setError('ログインが必要です');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/jewelry/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || '削除に失敗しました');
      }

      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    console.log('Form data:', formData);
    
    const token = getAuthToken();
    console.log('Token:', token ? 'exists' : 'missing');
    if (!token) {
      setError('ログインが必要です');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 新しい画像をアップロード（エラーが出ても続行）
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          uploadedUrls = await uploadImages();
        } catch (uploadErr) {
          console.warn('画像アップロードに失敗しましたが、商品登録を続行します:', uploadErr);
        }
      }
      
      // 既存の画像URLと新しくアップロードした画像URLを結合
      const existingUrls = formData.image_urls.filter(url => url.trim() !== '');
      const allImageUrls = [...existingUrls, ...uploadedUrls];
      
      const payload = {
        ...formData,
        image_urls: allImageUrls.length > 0 ? allImageUrls : undefined,
      };

      const url = editingProduct 
        ? `${API_URL}/jewelry/products/${editingProduct.id}`
        : `${API_URL}/jewelry/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      console.log('Sending payload:', payload);
      console.log('URL:', url);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, data);
        throw new Error(data.detail || `保存に失敗しました (${response.status})`);
      }

      await fetchProducts();
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const totalImages = formData.image_urls.filter(url => url).length + imageFiles.length + files.length;
    if (totalImages > 5) {
      setError('画像は最大5枚までです');
      return;
    }
    
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // プレビューURLを生成
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const newUrls = formData.image_urls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      image_urls: newUrls,
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const token = getAuthToken();
    if (!token || imageFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of imageFiles) {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      
      try {
        const response = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataObj,
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          throw new Error('画像のアップロードに失敗しました');
        }
      } catch (err) {
        console.error('Image upload error:', err);
        throw err;
      }
    }
    
    return uploadedUrls;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>ジュエリー商品管理</h1>
        <div>
          <button
            onClick={() => navigate('/jewelry')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            商品一覧へ
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            新規商品登録
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              {editingProduct ? '商品を編集' : '新規商品登録'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* 画像セクション - 最上部に配置 */}
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', fontSize: '16px' }}>
                  商品画像（最大5枚）
                </label>
                
                {/* 既存の画像 */}
                {formData.image_urls.filter(url => url).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    {formData.image_urls.filter(url => url).map((url, index) => (
                      <div key={`existing-${index}`} style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <img
                          src={url}
                          alt={`既存画像 ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                          aria-label="画像を削除"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 新しい画像のプレビュー */}
                {imagePreviewUrls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    {imagePreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <img
                          src={url}
                          alt={`新規画像 ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                          aria-label="画像を削除"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* ファイル選択 */}
                {(formData.image_urls.filter(url => url).length + imageFiles.length) < 5 && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', color: '#9ca3af' }}>📷</div>
                      <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>クリックして画像を追加</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {/* 商品番号 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  商品番号
                </label>
                <input
                  type="text"
                  value={formData.product_code}
                  onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                  placeholder="例: JW-001"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  商品名 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  商品説明 <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    素材
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="例: K18ゴールド"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    サイズ
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="例: 7号〜15号"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  その他補足情報
                </label>
                <textarea
                  value={formData.additional_info}
                  onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  カテゴリー <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  aria-label="カテゴリーを選択"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                >
                  {JEWELRY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    価格（円） <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    required
                    min={0}
                    placeholder="価格を入力"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    送料（円）
                  </label>
                  <input
                    type="number"
                    value={formData.shipping_fee || ''}
                    onChange={(e) => setFormData({ ...formData, shipping_fee: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    min={0}
                    placeholder="0=送料無料"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    在庫数（0=無制限）
                  </label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    min={0}
                    placeholder="0=無制限"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.price_includes_tax}
                    onChange={(e) => setFormData({ ...formData, price_includes_tax: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  税込価格
                </label>
              </div>

              {/* チェックボックスセクション */}
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_certificate}
                      onChange={(e) => setFormData({ ...formData, has_certificate: e.target.checked })}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: formData.has_certificate ? '#10b981' : '#e5e7eb',
                      color: formData.has_certificate ? 'white' : '#6b7280',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}>
                      鑑定証つき
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.has_gem_id}
                      onChange={(e) => setFormData({ ...formData, has_gem_id: e.target.checked })}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: formData.has_gem_id ? '#3b82f6' : '#e5e7eb',
                      color: formData.has_gem_id ? 'white' : '#6b7280',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}>
                      鑑別証つき
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_sold_out}
                      onChange={(e) => {
                        const isSoldOut = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          is_sold_out: isSoldOut,
                          stock: isSoldOut ? 0 : formData.stock
                        });
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: formData.is_sold_out ? '#1f2937' : '#e5e7eb',
                      color: formData.is_sold_out ? 'white' : '#6b7280',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}>
                      Sold Out
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: submitting ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? '保存中...' : (editingProduct ? '更新' : '登録')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* カテゴリーフィルター */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: '500' }}>カテゴリーで絞り込み:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="カテゴリーで絞り込み"
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
          }}
        >
          <option value="">すべて</option>
          {JEWELRY_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>画像</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>商品名</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>カテゴリー</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>価格</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>在庫</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>状態</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => !filterCategory || p.category === filterCategory).length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  商品がありません。「新規商品登録」ボタンから商品を追加してください。
                </td>
              </tr>
            ) : (
              products.filter(p => !filterCategory || p.category === filterCategory).map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '12px',
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {product.material && `素材: ${product.material}`}
                      {product.material && product.size && ' / '}
                      {product.size && `サイズ: ${product.size}`}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                    }}>
                      {getCategoryName(product.category)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ fontWeight: '500' }}>
                      ¥{product.price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {product.price_includes_tax ? '税込' : '税別'}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {product.stock === 0 ? '無制限' : product.stock}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: product.is_active ? '#d1fae5' : '#fee2e2',
                      color: product.is_active ? '#059669' : '#dc2626',
                    }}>
                      {product.is_active ? '販売中' : '非公開'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JewelryAdmin;
