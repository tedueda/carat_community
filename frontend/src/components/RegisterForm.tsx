import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL, DIRECT_API_URL } from '../config';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isRegistering = useRef(false);
  const isSubmitting = useRef(false);
  
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // 既にログイン済みのユーザーが直接 /register にアクセスした場合はリダイレクト
  // ただし登録処理中（login→navigate('/subscribe')の間）はリダイレクトしない
  useEffect(() => {
    if (user && !isRegistering.current) {
      navigate('/feed');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 二重送信防止
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (!phoneNumber.trim()) {
      setError('携帯番号は必須です');
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    try {
      const registerBody = JSON.stringify({
        email,
        password,
        display_name: displayName,
        phone_number: phoneNumber.trim()
      });
      const registerHeaders = { 'Content-Type': 'application/json' };

      // Try proxy first, then fallback to direct backend URL
      let response: Response | null = null;
      for (const baseUrl of [API_URL, DIRECT_API_URL]) {
        try {
          console.log('Registration attempt:', { baseUrl: baseUrl || '(proxy)', email });
          response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: registerHeaders,
            body: registerBody,
          });
          console.log('Registration response:', response.status, response.statusText);
          if (response.ok || response.status === 400) break; // success or known error, stop retrying
        } catch (fetchErr) {
          console.warn('Fetch failed for', baseUrl || '(proxy)', fetchErr);
          response = null; // try next URL
        }
      }

      if (!response) {
        setError('サーバーに接続できません。しばらくしてからもう一度お試しください。');
        setIsLoading(false);
        isSubmitting.current = false;
        return;
      }

      if (response.ok) {
        // 登録処理中フラグを立てて、useEffectによる/feedリダイレクトを防止
        isRegistering.current = true;
        const loginSuccess = await login(email, password);
        if (loginSuccess) {
          // login成功後、サブスク登録ページへ遷移
          navigate('/subscribe', { replace: true });
          return;
        } else {
          isRegistering.current = false;
          navigate('/login');
        }
      } else {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail || '';
        if (detail.includes('already registered')) {
          setError('このメールアドレスは既に登録されています。ログインしてください。');
        } else {
          setError(`登録に失敗しました: ${detail || response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(`登録エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    setIsLoading(false);
    isSubmitting.current = false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carat-gray1 px-4">
      <Card className="w-full max-w-md bg-carat-white border-carat-gray2 shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-carat-gray4" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-carat-black">会員登録</CardTitle>
          <CardDescription className="text-lg md:text-xl text-carat-gray5">
            アカウントを作成して全機能をご利用ください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-lg md:text-xl text-carat-black">表示名</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder="太郎ちゃん"
              />
              <p className="text-sm text-carat-gray5">
                ニックネームを入力してください。本名は後で設定できます。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg md:text-xl text-carat-black">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-lg md:text-xl text-carat-black">
                携帯番号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder="090-1234-5678"
              />
              <p className="text-sm text-carat-gray5">
                固有のIDとして使用されます。変更できません。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg md:text-xl text-carat-black">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder="8文字以上"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lg md:text-xl text-carat-black">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder="パスワードを再入力"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-gray-800 transition-colors text-lg font-bold py-6 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : 'アカウントを作成'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-base text-black">
              既にアカウントをお持ちの方は{' '}
              <Link to="/login" className="text-purple-700 hover:text-purple-900 font-semibold underline">
                こちらからログイン
              </Link>
            </p>
            <p className="text-xs text-carat-gray4">
              登録することで利用規約に同意したことになります
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
