import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resilientFetch } from '@/contexts/AuthContext';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('トークンが見つかりません。メールのリンクから再度アクセスしてください。');
      return;
    }

    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resilientFetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || '再設定に失敗しました');
      }

      setMessage('パスワードを更新しました。ログインしてください。');
      setTimeout(() => navigate('/login'), 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '再設定に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-gray-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-black">新しいパスワード設定</CardTitle>
          <CardDescription className="text-gray-500">
            新しいパスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-black font-medium">新しいパスワード</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="border-gray-300 focus:border-black focus:ring-black h-12"
                placeholder="8文字以上"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-black font-medium">新しいパスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="border-gray-300 focus:border-black focus:ring-black h-12"
                placeholder="もう一度入力"
              />
            </div>

            {message && (
              <div className="text-green-700 text-sm bg-green-50 p-3 rounded border border-green-200">{message}</div>
            )}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? '更新中...' : 'パスワードを更新'}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-sm text-gray-700 hover:underline"
            >
              ログイン画面へ戻る
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
