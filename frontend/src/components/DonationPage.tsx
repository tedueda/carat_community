import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Users, Search, Filter, Clock, Star, Plus, Minus, Upload, Home, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

interface Project {
  id: number;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  deadline: string;
  image_urls: string[];
  creator_name: string;
  creator_id: number;
  category: string;
  supporters_count: number;
}

const DonationPage: React.FC = () => {
  console.log('=== DonationPage FULL VERSION component loaded successfully ===');
  console.log('Component render time:', new Date().toISOString());
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('new');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
    category: '',
    newImages: [] as File[]
  });
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
    category: 'アート',
    images: [] as File[]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rewards, setRewards] = useState([
    { amount: '', description: '' }
  ]);
  const [supportAmount, setSupportAmount] = useState('');

  // プロジェクト一覧を取得（PostsのAPIを使用）
  const fetchProjects = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/api/posts/?category=funding&limit=50`, { headers });
      if (response.ok) {
        const data = await response.json();
        // PostsのデータをProject形式に変換
        const projects = data.map((post: any) => ({
          id: post.id,
          title: post.title || '',
          description: post.body || '',
          goal_amount: post.goal_amount || 0,
          current_amount: post.current_amount || 0,
          deadline: post.deadline || post.created_at,
          image_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
          creator_name: post.user_display_name || '匿名',
          creator_id: post.user_id,
          category: post.subcategory || 'その他',
          supporters_count: post.like_count || 0
        }));
        setProjects(projects);
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
    }
  };

  // 初回読み込み時にプロジェクトを取得
  React.useEffect(() => {
    fetchProjects();
  }, [token]);

  // 支援ボタンクリック
  const handleSupport = (project: Project) => {
    console.log('支援ボタンクリック:', project.title);
    setSelectedProject(project);
    setShowSupportModal(true);
  };

  // プロジェクト作成ボタンクリック
  const handleCreateProject = () => {
    console.log('プロジェクト作成ボタンクリック');
    setShowCreateProject(true);
  };

  // プロジェクト作成フォーム送信
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('新規プロジェクト作成:', newProject);
    
    // バリデーション
    if (!newProject.title || !newProject.description || !newProject.goal_amount || !newProject.deadline) {
      alert('すべての項目を入力してください。');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // 1. まず画像をアップロード（CreatePostと同じ仕様）
      const mediaIds: number[] = [];
      for (const image of newProject.images) {
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
          console.error('Image upload failed', uploadResponse.status);
        }
      }

      // 2. Postsとして作成（category: funding）
      const response = await fetch(`${API_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newProject.title,
          body: newProject.description,
          category: 'funding',
          subcategory: newProject.category,
          visibility: 'public',
          media_ids: mediaIds,
          goal_amount: parseInt(newProject.goal_amount) || 0,
          deadline: newProject.deadline || null
        })
      });

      if (!response.ok) {
        throw new Error('プロジェクトの作成に失敗しました');
      }

      const newPostData = await response.json();
      
      // PostデータをProject形式に変換
      const newProjectData = {
        id: newPostData.id,
        title: newPostData.title || '',
        description: newPostData.body || '',
        goal_amount: newPostData.goal_amount || 0,
        current_amount: newPostData.current_amount || 0,
        deadline: newPostData.deadline || newPostData.created_at,
        image_urls: newPostData.media_urls || [],
        creator_name: newPostData.user_display_name || '匿名',
        creator_id: newPostData.user_id,
        category: newPostData.subcategory || 'その他',
        supporters_count: 0
      };
      
      // プロジェクトリストに追加
      setProjects(prev => [newProjectData, ...prev]);

      // 成功メッセージ
      alert(`プロジェクト「${newProject.title}」を作成しました！`);
      
      // フォームリセット
      setNewProject({
        title: '',
        description: '',
        goal_amount: '',
        deadline: '',
        category: 'アート',
        images: []
      });
      setRewards([{ amount: '', description: '' }]);
      setShowCreateProject(false);
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
      alert('プロジェクトの作成に失敗しました。もう一度お試しください。');
    }
  };

  // フォーム入力変更
  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 画像アップロード（複数対応）
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // 最大5枚まで
      const newImages = [...newProject.images, ...files].slice(0, 5);
      setNewProject(prev => ({
        ...prev,
        images: newImages
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // リワード追加
  const addReward = () => {
    setRewards(prev => [...prev, { amount: '', description: '' }]);
  };

  // リワード削除
  const removeReward = (index: number) => {
    if (rewards.length > 1) {
      setRewards(prev => prev.filter((_, i) => i !== index));
    }
  };

  // リワード変更
  const handleRewardChange = (index: number, field: 'amount' | 'description', value: string) => {
    setRewards(prev => prev.map((reward, i) => 
      i === index ? { ...reward, [field]: value } : reward
    ));
  };

  // プロジェクトデータ（実際のデータベースから取得する予定）
  const [projects, setProjects] = useState<Project[]>([]);

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'art', label: 'アート' },
    { key: 'education', label: '教育' },
    { key: 'event', label: 'イベント' },
    { key: 'support', label: '支援' },
    { key: 'wedding', label: 'ウェディング' }
  ];

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ja-JP');
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-carat-gray1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-carat-white py-20">
        <div className="absolute inset-0 bg-carat-gray1/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ホームに戻るボタン */}
          <div className="mb-6">
            <button
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-carat-gray6 hover:text-carat-black transition-colors"
            >
              <Home className="h-5 w-5" />
              ホームに戻る
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-carat-black mb-6 leading-tight">
              寄付金を募る
            </h1>
            <p className="text-xl md:text-2xl text-carat-gray5 mb-8 max-w-4xl mx-auto leading-relaxed">
              LGBTQ+コミュニティの仲間を支援するページ
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-lg text-carat-gray5 mb-8">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-carat-black" />
              <span>目標達成率 {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + calculateProgress(p.current_amount, p.goal_amount), 0) / projects.length) : 0}%</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-carat-black" />
              <span>{projects.reduce((sum, p) => sum + p.supporters_count, 0)}名の支援者</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-carat-black" />
              <span>{projects.length}つの進行中プロジェクト</span>
            </div>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={handleCreateProject}
              className="bg-carat-black text-carat-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-carat-gray6 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              プロジェクトを作成
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-carat-white border-b border-carat-gray2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carat-gray4 w-5 h-5" />
              <input
                type="text"
                placeholder="プロジェクトを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-carat-gray3 rounded-lg focus:ring-2 focus:ring-carat-black/20 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-carat-black text-carat-white'
                      : 'bg-carat-gray2 text-carat-gray6 hover:bg-carat-gray3'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-carat-gray4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-carat-gray3 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-carat-black/20 focus:border-transparent"
                aria-label="並び替え順序"
              >
                <option value="new">新着順</option>
                <option value="popular">人気順</option>
                <option value="progress">達成率順</option>
                <option value="deadline">締切順</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const progress = calculateProgress(project.current_amount, project.goal_amount);
              const daysLeft = getDaysLeft(project.deadline);

              return (
                <div 
                  key={project.id} 
                  className="bg-carat-white rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-carat-gray2 cursor-pointer"
                  onClick={() => {
                    setSelectedProject(project);
                    setDetailImageIndex(0);
                    setShowProjectDetail(true);
                  }}
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                    {project.image_urls && project.image_urls.length > 0 ? (
                      <img
                        src={(() => {
                          const imageUrl = project.image_urls[0];
                          if (!imageUrl) return '';
                          if (imageUrl.startsWith('http')) return imageUrl;
                          return `${API_URL}${imageUrl}`;
                        })()}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="mx-auto h-16 w-16 mb-2" />
                        <p className="text-sm">画像なし</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-carat-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-carat-gray6">
                      {project.category}
                    </div>
                    <div className="absolute top-4 right-4 bg-carat-black/70 text-carat-white px-3 py-1 rounded-full text-sm font-medium">
                      {progress.toFixed(0)}%
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-carat-black mb-2">
                      {project.title}
                    </h3>
                    <p className="text-carat-gray6 mb-4">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-carat-gray5">進捗状況</span>
                        <span className="text-sm font-medium text-carat-black">
                          {formatAmount(project.current_amount)}円 / {formatAmount(project.goal_amount)}円
                        </span>
                      </div>
                      <div className="w-full bg-carat-gray2 rounded-full h-2">
                        <div
                          className="bg-carat-black h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex justify-between items-center mb-4 text-sm text-carat-gray5">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{project.supporters_count}人の支援者</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>残り{daysLeft}日</span>
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-carat-black rounded-full flex items-center justify-center text-carat-white text-sm font-bold">
                          {project.creator_name.charAt(0)}
                        </div>
                        <span className="ml-2 text-sm text-carat-gray5">{project.creator_name}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSupport(project);
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                      >
                        支援する
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-carat-gray2 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-carat-gray4" />
              </div>
              <h3 className="text-lg font-semibold text-carat-black mb-2">プロジェクトが見つかりません</h3>
              <p className="text-carat-gray5">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </section>


      {/* Support Modal */}
      {showSupportModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowSupportModal(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">プロジェクトを支援</h3>
            <p className="text-gray-600 mb-6">{selectedProject.title}</p>
            
            {/* 支援金入力 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支援金額（任意）
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={supportAmount}
                  onChange={(e) => setSupportAmount(e.target.value)}
                  placeholder="例: 5000"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">円</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">※ 金額を入力しない場合は応援メッセージのみ送信されます</p>
            </div>

            {/* 説明文 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                「支援する」ボタンを押すと、プロジェクト投稿者に直接チャットメッセージが届きます。
                支払い方法については、チャットで直接やり取りをお願いいたします。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  
                  const amount = supportAmount ? `${Number(supportAmount).toLocaleString()}円` : '応援';
                  const message = `「${selectedProject.title}」に対し${amount}を支援します`;
                  
                  try {
                    // 支援メッセージを送信（マッチングなしで直接送信可能）
                    const response = await fetch(`${API_URL}/api/donation/support-message`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        project_id: selectedProject.id,
                        amount: supportAmount ? parseInt(supportAmount) : null,
                        message: message
                      })
                    });
                    
                    if (response.ok) {
                      setShowSupportModal(false);
                      setSupportAmount('');
                      alert('支援メッセージを送信しました！');
                      navigate(`/matching/chats`);
                    } else {
                      const errorData = await response.json();
                      alert(errorData.detail || 'メッセージの送信に失敗しました');
                    }
                  } catch (error) {
                    console.error('Support error:', error);
                    alert('エラーが発生しました');
                  }
                }}
                className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                支援する
              </button>
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportAmount('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => { setShowProjectDetail(false); setIsEditing(false); }}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">{selectedProject.title}</h3>
              <button
                onClick={() => { setShowProjectDetail(false); setIsEditing(false); }}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Image Slider */}
              {selectedProject.image_urls && selectedProject.image_urls.length > 0 && (
                <div className="relative">
                  <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                    <img
                      src={(() => {
                        const imageUrl = selectedProject.image_urls[detailImageIndex];
                        if (!imageUrl) return '';
                        if (imageUrl.startsWith('http')) return imageUrl;
                        return `${API_URL}${imageUrl}`;
                      })()}
                      alt={`${selectedProject.title} - 画像${detailImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  {/* Navigation buttons */}
                  {selectedProject.image_urls.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        onClick={() => setDetailImageIndex((prev) => (prev === 0 ? selectedProject.image_urls.length - 1 : prev - 1))}
                        aria-label="前の画像"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                        onClick={() => setDetailImageIndex((prev) => (prev === selectedProject.image_urls.length - 1 ? 0 : prev + 1))}
                        aria-label="次の画像"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedProject.image_urls.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${index === detailImageIndex ? 'bg-white' : 'bg-white/50'}`}
                            onClick={() => setDetailImageIndex(index)}
                            aria-label={`画像${index + 1}を表示`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Creator info and edit/delete buttons */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                      {selectedProject.creator_name.charAt(0)}
                    </div>
                    <span className="ml-3 font-medium text-gray-900">{selectedProject.creator_name}</span>
                  </div>
                  {/* デバッグ: user.id={user?.id}, creator_id={selectedProject.creator_id} */}
                  {user && Number(user.id) === Number(selectedProject.creator_id) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditProject({
                            title: selectedProject.title,
                            description: selectedProject.description,
                            goal_amount: String(selectedProject.goal_amount),
                            deadline: selectedProject.deadline,
                            category: selectedProject.category,
                            newImages: []
                          });
                          setIsEditing(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                        編集
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('このプロジェクトを削除しますか？')) {
                            const tkn = localStorage.getItem('token');
                            const response = await fetch(`${API_URL}/api/posts/${selectedProject.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${tkn}` }
                            });
                            if (response.ok) {
                              setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
                              setShowProjectDetail(false);
                              alert('削除しました');
                            } else {
                              alert('削除に失敗しました');
                            }
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                        削除
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit form or display */}
                {isEditing ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const tkn = localStorage.getItem('token');
                    
                    // 新しい画像がある場合はアップロード
                    const mediaIds: number[] = [];
                    for (const image of editProject.newImages) {
                      const imageFormData = new FormData();
                      imageFormData.append('file', image);
                      const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${tkn}` },
                        body: imageFormData,
                      });
                      if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        mediaIds.push(uploadResult.id);
                      }
                    }
                    
                    const updateData: Record<string, unknown> = {
                      title: editProject.title,
                      body: editProject.description,
                      category: 'funding',
                      subcategory: editProject.category
                    };
                    if (mediaIds.length > 0) {
                      updateData.media_ids = mediaIds;
                    }
                    
                    const response = await fetch(`${API_URL}/api/posts/${selectedProject.id}`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${tkn}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(updateData)
                    });
                    if (response.ok) {
                      const updated = await response.json();
                      const updatedProject = {
                        ...selectedProject,
                        title: updated.title || '',
                        description: updated.body || '',
                        category: updated.subcategory || 'その他',
                        image_urls: updated.media_urls || selectedProject.image_urls
                      };
                      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
                      setSelectedProject(updatedProject);
                      setIsEditing(false);
                      setEditProject({ ...editProject, newImages: [] });
                      alert('更新しました');
                    } else {
                      alert('更新に失敗しました');
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                      <input
                        type="text"
                        value={editProject.title}
                        onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                      <textarea
                        value={editProject.description}
                        onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">目標金額</label>
                      <input
                        type="number"
                        value={editProject.goal_amount}
                        onChange={(e) => setEditProject({ ...editProject, goal_amount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="例: 100000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">締切日</label>
                      <input
                        type="date"
                        value={editProject.deadline}
                        onChange={(e) => setEditProject({ ...editProject, deadline: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">画像を変更</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={editFileInputRef}
                        onChange={(e) => {
                          if (e.target.files) {
                            setEditProject({ ...editProject, newImages: Array.from(e.target.files) });
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      {editProject.newImages.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">{editProject.newImages.length}枚の画像を選択中</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="flex-1 bg-black text-white py-2 rounded-lg">保存</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border py-2 rounded-lg">キャンセル</button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Category */}
                    <div className="mb-4">
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {selectedProject.category}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedProject.description}</p>

                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">進捗状況</span>
                        <span className="font-medium">
                          {formatAmount(selectedProject.current_amount)}円 / {formatAmount(selectedProject.goal_amount)}円
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-black h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(calculateProgress(selectedProject.current_amount, selectedProject.goal_amount), 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>{selectedProject.supporters_count}人の支援者</span>
                        <span>残り{getDaysLeft(selectedProject.deadline)}日</span>
                      </div>
                    </div>

                    {/* Support button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setShowProjectDetail(false);
                          handleSupport(selectedProject);
                        }}
                        className="w-[60%] bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        支援する
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={() => setShowCreateProject(false)}>
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">新しいプロジェクトを作成</h3>
            <div className="flex-1 overflow-y-auto pr-2">
            
            <form id="donation-form" onSubmit={handleSubmitProject} className="space-y-6 pb-6">
              {/* 画像アップロード（CreatePostと同じ仕様） */}
              <div className="space-y-2">
                <label className="text-gray-800 text-sm font-medium">画像をアップロード（最大5枚、任意）</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="donation-image-upload"
                  />
                  <label
                    htmlFor="donation-image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 text-orange-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700 mb-1">
                      クリックして画像を選択
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, WebP (最大10MB、5枚まで)
                    </span>
                  </label>
                </div>
                {newProject.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {newProject.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`アップロード画像 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          onClick={() => {
                            const newImages = newProject.images.filter((_, i) => i !== index);
                            setNewProject(prev => ({ ...prev, images: newImages }));
                          }}
                          aria-label={`画像${index + 1}を削除`}
                        >
                          ✕
                        </button>
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

              {/* プロジェクトタイトル */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  プロジェクトタイトル *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newProject.title}
                  onChange={handleProjectInputChange}
                  placeholder="例: LGBTQアートギャラリー開設プロジェクト"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* カテゴリー */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <select
                  id="category"
                  name="category"
                  value={newProject.category}
                  onChange={handleProjectInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="アート">アート</option>
                  <option value="教育">教育</option>
                  <option value="イベント">イベント</option>
                  <option value="支援">支援</option>
                  <option value="ウェディング">ウェディング</option>
                </select>
              </div>

              {/* プロジェクト説明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  プロジェクト説明 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newProject.description}
                  onChange={handleProjectInputChange}
                  placeholder="プロジェクトの詳細な説明を入力してください..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 目標金額 */}
              <div>
                <label htmlFor="goal_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  目標金額 *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="goal_amount"
                    name="goal_amount"
                    value={newProject.goal_amount}
                    onChange={handleProjectInputChange}
                    placeholder="500000"
                    min="1000"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">円</span>
                </div>
              </div>

              {/* 締切日 */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  締切日 *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={newProject.deadline}
                  onChange={handleProjectInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* リターン設定 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    リターン設定（任意）
                  </label>
                  <button
                    type="button"
                    onClick={addReward}
                    className="flex items-center gap-1 text-sm text-carat-black hover:text-carat-gray6"
                  >
                    <Plus className="w-4 h-4" />
                    リターンを追加
                  </button>
                </div>
                
                <div className="space-y-4">
                  {rewards.map((reward, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">リターン {index + 1}</h4>
                        {rewards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeReward(index)}
                            className="text-red-500 hover:text-red-700 relative z-20"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">リターン内容</label>
                        <textarea
                          value={reward.description}
                          onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                          placeholder="例: お礼メール + 限定ステッカー"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  ※ 支援者は任意の金額で支援できます。リターンは参考情報として表示されます。
                </p>
              </div>

            </form>
            </div>
            {/* ボタン - フォームの外、モーダル下部に固定 */}
            <div className="pt-4 pb-2 flex gap-3 border-t border-gray-200 bg-white">
              <button
                type="submit"
                form="donation-form"
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
              >
                プロジェクトを作成
              </button>
              <button
                type="button"
                onClick={() => setShowCreateProject(false)}
                className="flex-1 py-2 px-4 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPage;
