import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface CreateSalonRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface Identity {
  value: string;
  label: string;
}

interface RoomType {
  value: string;
  label: string;
}

const CreateSalonRoomModal: React.FC<CreateSalonRoomModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { token } = useAuth();
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [targetIdentities, setTargetIdentities] = useState<string[]>(['ALL']);
  const [roomType, setRoomType] = useState('exchange');
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (isOpen && token) {
      fetchOptions();
    }
  }, [isOpen, token]);

  const fetchOptions = async () => {
    try {
      const [identitiesRes, roomTypesRes] = await Promise.all([
        fetch(`${API_URL}/api/salon/identities`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/salon/room-types`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (identitiesRes.ok) {
        const data = await identitiesRes.json();
        setIdentities(data.identities);
      }

      if (roomTypesRes.ok) {
        const data = await roomTypesRes.json();
        setRoomTypes(data.room_types);
      }
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const handleIdentityChange = (value: string, checked: boolean) => {
    if (value === 'ALL') {
      if (checked) {
        setTargetIdentities(['ALL']);
      } else {
        setTargetIdentities([]);
      }
    } else {
      if (checked) {
        setTargetIdentities((prev) => {
          const newIdentities = prev.filter((id) => id !== 'ALL');
          return [...newIdentities, value];
        });
      } else {
        setTargetIdentities((prev) => prev.filter((id) => id !== value));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!theme.trim()) {
      setError('テーマを入力してください');
      return;
    }
    
    if (!description.trim()) {
      setError('内容説明を入力してください');
      return;
    }
    
    if (targetIdentities.length === 0) {
      setError('対象性自認を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/salon/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: theme.trim(),
          description: description.trim(),
          target_identities: targetIdentities,
          room_type: roomType,
          allow_anonymous: allowAnonymous,
        }),
      });

      if (response.ok) {
        setTheme('');
        setDescription('');
        setTargetIdentities(['ALL']);
        setRoomType('exchange');
        setAllowAnonymous(false);
        onCreated();
      } else {
        const data = await response.json();
        setError(data.detail || 'ルームの作成に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">新しいルームを作成</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="theme">テーマ *</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例: ゲイの恋愛相談"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">内容説明 *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ルームの目的や話し合いたい内容を説明してください"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>種別 *</Label>
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={roomType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoomType(type.value)}
                  className={roomType === type.value ? 'bg-black' : ''}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>対象性自認 *</Label>
            <div className="grid grid-cols-2 gap-2">
              {identities.map((identity) => (
                <div key={identity.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`identity-${identity.value}`}
                    checked={targetIdentities.includes(identity.value)}
                    onCheckedChange={(checked) =>
                      handleIdentityChange(identity.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`identity-${identity.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {identity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow-anonymous"
              checked={allowAnonymous}
              onCheckedChange={(checked) => setAllowAnonymous(checked as boolean)}
            />
            <label htmlFor="allow-anonymous" className="text-sm cursor-pointer">
              匿名での参加を許可する
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              {loading ? '作成中...' : '作成する'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSalonRoomModal;
