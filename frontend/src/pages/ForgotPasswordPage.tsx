import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resilientFetch } from '@/contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await resilientFetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || '送信に失敗しました');
      }

      setMessage('再設定用の案内メールを送信しました。メールをご確認ください。');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-gray-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-black">パスワード再設定</CardTitle>
          <CardDescription className="text-gray-500">
            登録済みのメールアドレスを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-medium">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-black focus:ring-black h-12"
                placeholder="your@email.com"
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
              {isLoading ? '送信中...' : '再設定メールを送信'}
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

export default ForgotPasswordPage;
