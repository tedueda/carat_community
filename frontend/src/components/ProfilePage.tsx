import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Shield } from 'lucide-react';

interface Profile {
  user_id: number;
  handle: string;
  bio?: string;
  orientation_id?: number;
  gender_id?: number;
  pronoun_id?: number;
  birthday?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  banner_url?: string;
  is_profile_public: boolean;
  show_orientation: boolean;
  show_gender: boolean;
  show_pronoun: boolean;
  show_birthday: boolean;
  show_location: boolean;
  created_at: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else {
        setError('プロフィールの読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('プロフィールの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('プロフィールの更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof Profile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-pink-600">プロフィールを読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <Card className="border-pink-200">
          <CardContent className="text-center py-12">
            <p className="text-red-600">プロフィールの読み込みに失敗しました</p>
            <Button onClick={fetchProfile} className="mt-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white">
              再試行
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-800 mb-2">あなたのプロフィール</h1>
        <p className="text-gray-600">プロフィール情報とプライバシー設定を管理</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center text-sm sm:text-base">
            <User className="h-4 w-4 mr-1 sm:mr-2" />
            プロフィール情報
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center text-sm sm:text-base">
            <Shield className="h-4 w-4 mr-1 sm:mr-2" />
            プライバシー設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-pink-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <span className="text-pink-800">プロフィール情報</span>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                    <Settings className="h-4 w-4 mr-2" />
                    編集
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white">
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}
                      className="border-pink-300 text-pink-700 hover:bg-pink-50"
                    >
                      キャンセル
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="handle" className="text-gray-700">ハンドル名</Label>
                  <Input
                    id="handle"
                    value={profile.handle}
                    onChange={(e) => updateProfile('handle', e.target.value)}
                    disabled={!isEditing}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700">場所</Label>
                  <Input
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="あなたの都市や地域"
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-700">自己紹介</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="あなたについて教えてください..."
                  rows={4}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-700">ウェブサイト</Label>
                <Input
                  id="website"
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => updateProfile('website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://your-website.com"
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-800">プライバシー設定</CardTitle>
              <p className="text-sm text-gray-600">
                他のユーザーに表示される情報をコントロール
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-public" className="text-gray-700">公開プロフィール</Label>
                  <p className="text-sm text-gray-600">プロフィールを誰でも見られるようにする</p>
                </div>
                <Switch
                  id="profile-public"
                  checked={profile.is_profile_public}
                  onCheckedChange={(checked) => updateProfile('is_profile_public', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-location" className="text-gray-700">場所を表示</Label>
                  <p className="text-sm text-gray-600">プロフィールに場所を表示する</p>
                </div>
                <Switch
                  id="show-location"
                  checked={profile.show_location}
                  onCheckedChange={(checked) => updateProfile('show_location', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-orientation" className="text-gray-700">性的指向を表示</Label>
                  <p className="text-sm text-gray-600">性的指向を表示する</p>
                </div>
                <Switch
                  id="show-orientation"
                  checked={profile.show_orientation}
                  onCheckedChange={(checked) => updateProfile('show_orientation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-gender" className="text-gray-700">性自認を表示</Label>
                  <p className="text-sm text-gray-600">性自認を表示する</p>
                </div>
                <Switch
                  id="show-gender"
                  checked={profile.show_gender}
                  onCheckedChange={(checked) => updateProfile('show_gender', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-pronoun" className="text-gray-700">代名詞を表示</Label>
                  <p className="text-sm text-gray-600">希望する代名詞を表示する</p>
                </div>
                <Switch
                  id="show-pronoun"
                  checked={profile.show_pronoun}
                  onCheckedChange={(checked) => updateProfile('show_pronoun', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-birthday" className="text-gray-700">誕生日を表示</Label>
                  <p className="text-sm text-gray-600">誕生日（年齢のみ）を表示する</p>
                </div>
                <Switch
                  id="show-birthday"
                  checked={profile.show_birthday}
                  onCheckedChange={(checked) => updateProfile('show_birthday', checked)}
                />
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-green-500 to-pink-400 hover:from-green-600 hover:to-pink-500 text-white"
              >
                {isSaving ? 'プライバシー設定を保存中...' : 'プライバシー設定を保存'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
