import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      setIsLoading(false);
      return;
    }

    if (!phoneNumber.trim()) {
      setError(t('auth.phoneRequired'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          phone_number: phoneNumber.trim()
        })
      });

      if (response.ok) {
        // 登録成功後、自動的にログイン
        const loginSuccess = await login(email, password);
        if (loginSuccess) {
          navigate('/feed');
        } else {
          // ログインに失敗した場合はログインページへ
          navigate('/login');
        }
      } else {
        setError(t('auth.emailAlreadyUsed'));
      }
    } catch (err) {
      setError(t('auth.registrationFailed'));
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carat-gray1 px-4">
      <Card className="w-full max-w-md bg-carat-white border-carat-gray2 shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-carat-gray4" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-carat-black">{t('common.register')}</CardTitle>
          <CardDescription className="text-lg md:text-xl text-carat-gray5">
            {t('auth.registerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-lg md:text-xl text-carat-black">{t('auth.displayName')}</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder={t('auth.displayNamePlaceholder')}
              />
              <p className="text-sm text-carat-gray5">
                {t('auth.displayNameHint')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg md:text-xl text-carat-black">{t('auth.email')}</Label>
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
                {t('auth.phoneNumber')} <span className="text-red-500">*</span>
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
                {t('auth.phoneHint')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg md:text-xl text-carat-black">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lg md:text-xl text-carat-black">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-carat-gray3 focus:border-carat-black focus:ring-carat-black/20"
                placeholder={t('auth.confirmPasswordPlaceholder')}
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
              {isLoading ? t('common.loading') : t('auth.createAccount')}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-base text-black">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-purple-700 hover:text-purple-900 font-semibold underline">
                {t('common.login')}
              </Link>
            </p>
            <p className="text-xs text-carat-gray4">
              {t('auth.termsAgreement')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
