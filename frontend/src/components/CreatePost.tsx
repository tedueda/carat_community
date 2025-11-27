import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Music, MessageSquare, Store, MapPin, Film, FileText, Palette, Upload, X } from 'lucide-react';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [category, setCategory] = useState('board');
  const [subcategory, setSubcategory] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [tourismData, setTourismData] = useState({
    prefecture: '',
    eventDatetime: '',
    meetPlace: '',
    meetAddress: '',
    tourContent: '',
    fee: '',
    contactPhone: '',
    contactEmail: '',
    deadline: '',
    attachmentPdfUrl: ''
  });
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const { categoryKey } = useParams();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const categories = [
    // サブカルチャー（= comics カテゴリ）
    { key: 'comics', name: 'サブカルチャー', icon: Film, description: '映画・アニメ・ゲーム・小説などの作品レビューと感想' },
    // アート
    { key: 'art', name: 'アート', icon: Palette, description: 'イラスト・写真・映像作品の発表' },
    // 音楽
    { key: 'music', name: '音楽', icon: Music, description: 'お気に入りや自作・AI曲の共有' },
    // 掲示板（一般相談・雑談）
    { key: 'board', name: '掲示板', icon: MessageSquare, description: '悩み相談や雑談、生活の話題' },
    // お店
    { key: 'shops', name: 'お店', icon: Store, description: 'LGBTQフレンドリーなお店紹介' },
    // ツーリズム
    { key: 'tourism', name: 'ツーリズム', icon: MapPin, description: '会員ガイドの交流型ツアー' },
    // ブログは既存ルート互換のため残すが、掲示板メニューとは別枠の長文記事カテゴリとして扱う
    { key: 'blog', name: 'ブログ', icon: FileText, description: '長文記事・体験談・エッセイ' },
  ];

  const subcategories: Record<string, string[]> = {
    board: ['悩み相談（カミングアウト／学校生活／職場環境）', '求人募集', '法律・手続き関係', '講座・勉強会', 'その他'],
    music: ['ジャズ', 'Jポップ', 'ポップス', 'R&B', 'ロック', 'AOR', 'クラシック', 'Hip-Hop', 'ラップ', 'ファンク', 'レゲエ', 'ワールド・ミュージック', 'AI生成音楽', 'その他'],
    shops: ['アパレル・ブティック', '雑貨店', 'レストラン・バー', '美容室・メイク', 'その他'],
    tourism: [],
    comics: ['映画', 'コミック', 'TVドラマ', '同人誌', 'その他'],
    art: []
  };

  const getLinkHostname = (url: string): string | null => {
    try {
      if (!url) return null;
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (categoryKey) {
      const validCategory = categories.find(cat => cat.key === categoryKey);
      if (validCategory) {
        setCategory(categoryKey);
        setSubcategory('');
      }
    }
  }, [categoryKey]);

  useEffect(() => {
    setSubcategory('');
  }, [category]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!body.trim()) {
      setError('投稿内容は必須です');
      setIsLoading(false);
      return;
    }

    if (category === 'music' && youtubeUrl && !extractYouTubeVideoId(youtubeUrl)) {
      setError('有効なYouTube URLを入力してください');
      setIsLoading(false);
      return;
    }

    if (images.length > 5) {
      setError('画像は5枚まで選択できます');
      setIsLoading(false);
      return;
    }

    for (const image of images) {
      if (image.size > 10 * 1024 * 1024) {
        setError('画像ファイルは10MB以下にしてください');
        setIsLoading(false);
        return;
      }
      if (!image.type.startsWith('image/')) {
        setError('画像ファイルのみアップロード可能です');
        setIsLoading(false);
        return;
      }
    }

    try {
      const mediaIds: number[] = [];
      
      for (const image of images) {
        const imageFormData = new FormData();
        imageFormData.append('file', image);
        
        const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          mediaIds.push(uploadResult.id);
        } else {
          const errText = await uploadResponse.text().catch(() => '');
          console.error('Image upload failed', uploadResponse.status, errText);
          setError(`画像アップロードに失敗しました (status ${uploadResponse.status})`);
          setIsLoading(false);
          return;
        }
      }

      const bodyWithLink = linkUrl.trim()
        ? `${body.trim()}\n\nリンク: ${linkUrl.trim()}`
        : body.trim();

      const postData: any = {
        title: title.trim() || null,
        body: bodyWithLink,
        visibility,
        youtube_url: youtubeUrl || null,
        media_ids: mediaIds.length > 0 ? mediaIds : null,
        category: category,
        subcategory: subcategory || null,
        post_type: category === 'blog' ? 'blog' : category === 'tourism' ? 'tourism' : 'post',
        status: category === 'blog' ? 'published' : undefined,
      };

      if (category === 'tourism' && tourismData.prefecture) {
        postData.tourism_details = {
          prefecture: tourismData.prefecture || null,
          event_datetime: tourismData.eventDatetime || null,
          meet_place: tourismData.meetPlace || null,
          meet_address: tourismData.meetAddress || null,
          tour_content: tourismData.tourContent || null,
          fee: tourismData.fee ? parseInt(tourismData.fee) : null,
          contact_phone: tourismData.contactPhone || null,
          contact_email: tourismData.contactEmail || null,
          deadline: tourismData.deadline || null,
          attachment_pdf_url: tourismData.attachmentPdfUrl || null,
        };
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        if (category === 'blog') {
          navigate('/blog');
        } else {
          navigate('/feed');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '投稿の作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.key === category);
  const CategoryIcon = selectedCategory?.icon || PlusCircle;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Card className="border border-gray-200 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-xl sm:text-2xl text-slate-900">
            <CategoryIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            {selectedCategory ? `${selectedCategory.name}に投稿` : '新しい投稿を作成'}
          </CardTitle>
          {selectedCategory && (
            <p className="text-sm text-gray-600 mt-1">{selectedCategory.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!categoryKey && (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-800">カテゴリー</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.key} value={cat.key}>
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {cat.name} - {cat.description}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {subcategories[category] && subcategories[category].length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-gray-800">サブカテゴリー</Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                    <SelectValue placeholder="選択してください..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories[category].map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-800">タイトル{category === 'tourism' ? ' *' : '（任意）'}</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投稿にタイトルをつけてください..."
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                required={category === 'tourism'}
              />
            </div>

            {category === 'tourism' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefecture" className="text-gray-800">都道府県</Label>
                    <Input
                      id="prefecture"
                      type="text"
                      value={tourismData.prefecture}
                      onChange={(e) => setTourismData({...tourismData, prefecture: e.target.value})}
                      placeholder="例: 東京都"
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDatetime" className="text-gray-800">開催日時</Label>
                    <Input
                      id="eventDatetime"
                      type="datetime-local"
                      value={tourismData.eventDatetime}
                      onChange={(e) => setTourismData({...tourismData, eventDatetime: e.target.value})}
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetPlace" className="text-gray-800">集合場所</Label>
                  <Input
                    id="meetPlace"
                    type="text"
                    value={tourismData.meetPlace}
                    onChange={(e) => setTourismData({...tourismData, meetPlace: e.target.value})}
                    placeholder="例: 新宿駅南口"
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetAddress" className="text-gray-800">集合場所（住所）</Label>
                  <Input
                    id="meetAddress"
                    type="text"
                    value={tourismData.meetAddress}
                    onChange={(e) => setTourismData({...tourismData, meetAddress: e.target.value})}
                    placeholder="例: 東京都新宿区西新宿1-1-1"
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tourContent" className="text-gray-800">ツアー内容（500字以内）</Label>
                  <Textarea
                    id="tourContent"
                    value={tourismData.tourContent}
                    onChange={(e) => setTourismData({...tourismData, tourContent: e.target.value})}
                    placeholder="ツアーの詳細内容を記載してください..."
                    maxLength={500}
                    rows={4}
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 resize-none"
                  />
                  <p className="text-xs text-gray-500">{tourismData.tourContent.length}/500文字</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee" className="text-gray-800">参加料金（円）</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={tourismData.fee}
                      onChange={(e) => setTourismData({...tourismData, fee: e.target.value})}
                      placeholder="例: 5000"
                      min="0"
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-gray-800">応募期日</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={tourismData.deadline}
                      onChange={(e) => setTourismData({...tourismData, deadline: e.target.value})}
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-gray-800">連絡先（携帯番号）</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={tourismData.contactPhone}
                      onChange={(e) => setTourismData({...tourismData, contactPhone: e.target.value})}
                      placeholder="例: 090-1234-5678"
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-gray-800">連絡先（メール）</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={tourismData.contactEmail}
                      onChange={(e) => setTourismData({...tourismData, contactEmail: e.target.value})}
                      placeholder="例: example@email.com"
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachmentPdf" className="text-gray-800">資料添付（PDF URL）</Label>
                  <Input
                    id="attachmentPdf"
                    type="url"
                    value={tourismData.attachmentPdfUrl}
                    onChange={(e) => setTourismData({...tourismData, attachmentPdfUrl: e.target.value})}
                    placeholder="PDFファイルのURL"
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
              </>
            )}

            {(category === 'board' || category === 'tourism' || category === 'shops' || category === 'comics' || category === 'art') && (
              <div className="space-y-2">
                <Label className="text-gray-800">画像をアップロード（最大5枚、任意）</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 text-orange-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700 mb-1">
                      クリックして画像を選択
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF (最大10MB、5枚まで)
                    </span>
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`アップロード画像 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          aria-label={`画像${index + 1}を削除`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                            メイン
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* リンクURL（任意） */}
            <div className="space-y-2">
              <Label htmlFor="linkUrl" className="text-gray-800">リンクURL（任意）</Label>
              <Input
                id="linkUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
              {getLinkHostname(linkUrl) && (
                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${getLinkHostname(linkUrl)}`}
                    alt="サイトアイコン"
                    className="w-5 h-5 rounded"
                  />
                  <a
                    href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 text-gray-800 truncate"
                  >
                    {getLinkHostname(linkUrl)} を開く
                  </a>
                </div>
              )}
            </div>

            {category === 'music' && (
              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-gray-800">YouTube URL（任意）</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                />
                {youtubeUrl && extractYouTubeVideoId(youtubeUrl) && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">プレビュー:</p>
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeVideoId(youtubeUrl)}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-800">内容 *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  category === 'board' ? 'あなたの質問、相談、想いを共有してください...' :
                  category === 'music' ? '音楽について、おすすめの楽曲やアーティストを教えてください...' :
                  category === 'shops' ? 'おすすめのお店やサービスを教えてください...' :
                  category === 'tourism' ? 'ツアーの見どころや参加者へのメッセージを記載してください...' :
                  category === 'comics' ? '本、映画、ドラマ、コミックのレビューを書いてください...' :
                  'あなたの想い、体験、質問などを共有してください...'
                }
                required
                rows={6}
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-gray-800">この投稿を見ることができる人</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌍 公開 - 誰でも見ることができます</SelectItem>
                  <SelectItem value="members">👥 メンバーのみ - 登録ユーザーのみ</SelectItem>
                  <SelectItem value="followers">👤 フォロワー - あなたをフォローしている人</SelectItem>
                  <SelectItem value="private">🔒 非公開 - あなたのみ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white"
                disabled={isLoading}
              >
                {isLoading ? '公開中...' : '投稿を公開'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/feed')}
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;
