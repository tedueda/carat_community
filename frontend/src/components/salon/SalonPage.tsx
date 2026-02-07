import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Plus, Lock, MessageCircle, Grid3x3, List, ArrowLeft } from 'lucide-react';
import SalonRoomCard from './SalonRoomCard';
import CreateSalonRoomModal from './CreateSalonRoomModal';

interface SalonRoom {
  id: number;
  creator_id: number;
  theme: string;
  description: string;
  target_identities: string[];
  room_type: string;
  allow_anonymous: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participant_count: number;
  creator_display_name: string | null;
}

const SalonPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<SalonRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const isPremium = user?.membership_type === 'premium' || user?.membership_type === 'admin';

  const fetchRooms = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRoomType) {
        params.append('room_type', selectedRoomType);
      }
      
      const response = await fetch(`${API_URL}/api/salon/rooms?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else if (response.status === 403) {
        setError('有料会員のみ利用可能です');
      } else {
        setError('ルームの取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRooms();
    } else {
      setLoading(false);
    }
  }, [token, selectedRoomType]);

  const handleRoomCreated = () => {
    setShowCreateModal(false);
    fetchRooms();
  };

  const roomTypes = [
    { value: null, label: 'すべて' },
    { value: 'consultation', label: '相談' },
    { value: 'exchange', label: '交流' },
    { value: 'story', label: 'ストーリー' },
    { value: 'other', label: 'その他' },
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/feed')}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">会員サロン</h1>
            <p className="text-gray-600 mt-1">有料会員限定の専門チャットサロン</p>
          </div>
          {isPremium && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 bg-black hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              ルームを作成
            </Button>
          )}
          {!isPremium && (
            <div className="mt-4 md:mt-0 text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <Lock className="h-4 w-4 inline mr-1" />
              ルーム作成・参加は有料会員限定
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {roomTypes.map((type) => (
              <Button
                key={type.value || 'all'}
                variant={selectedRoomType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRoomType(type.value)}
                className={selectedRoomType === type.value ? 'bg-black' : ''}
              >
                {type.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-black' : ''}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-black' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">まだルームがありません</p>
            <p className="text-gray-500 text-sm mt-2">最初のルームを作成してみましょう</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <SalonRoomCard
                key={room.id}
                room={room}
                onClick={() => navigate(`/salon/rooms/${room.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/salon/rooms/${room.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {room.room_type === 'consultation' ? '相談' :
                           room.room_type === 'exchange' ? '交流' :
                           room.room_type === 'story' ? 'ストーリー' : 'その他'}
                        </span>
                        {room.allow_anonymous && (
                          <span className="text-xs text-gray-500">匿名可</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{room.theme}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {room.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {room.participant_count}人
                        </span>
                        <span>作成者: {room.creator_display_name || 'ユーザー'}</span>
                        <span>{new Date(room.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateSalonRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleRoomCreated}
      />
    </div>
  );
};

export default SalonPage;
