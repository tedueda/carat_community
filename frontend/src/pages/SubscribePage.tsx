import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const COUNTRIES = [
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' },
  { code: 'BR', name: 'Brazil' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'CN', name: 'China' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IN', name: 'India' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IL', name: 'Israel' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'OTHER', name: 'Other' }
];

const LANGUAGES = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' }
];

const SubscribePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentLanguage } = useLanguage();
  
  const canceled = searchParams.get('canceled') === 'true';
  
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    password: '',
    password_confirm: '',
    preferred_lang: currentLanguage,
    residence_country: 'JP',
    terms_accepted: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.email || !formData.display_name || !formData.password) {
      setError(t('subscribe.error.required_fields'));
      return;
    }
    
    if (formData.password !== formData.password_confirm) {
      setError(t('subscribe.error.password_mismatch'));
      return;
    }
    
    if (formData.password.length < 8) {
      setError(t('subscribe.error.password_too_short'));
      return;
    }
    
    if (!formData.terms_accepted) {
      setError(t('subscribe.error.terms_required'));
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          display_name: formData.display_name,
          password: formData.password,
          preferred_lang: formData.preferred_lang,
          residence_country: formData.residence_country,
          terms_accepted: formData.terms_accepted
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t('subscribe.error.checkout_failed'));
      }
      
      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('subscribe.error.unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('subscribe.title')}
            </h1>
            <p className="text-purple-200">
              {t('subscribe.subtitle')}
            </p>
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="text-2xl font-bold text-white">
                ¥1,000<span className="text-sm font-normal text-purple-200">/{t('subscribe.per_month')}</span>
              </p>
            </div>
          </div>
          
          {canceled && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-200 text-sm">
                {t('subscribe.canceled_message')}
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {t('subscribe.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {t('subscribe.display_name')}
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('subscribe.display_name_placeholder')}
                required
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {t('subscribe.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="********"
                minLength={8}
                required
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {t('subscribe.password_confirm')}
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="********"
                minLength={8}
                required
              />
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {t('subscribe.preferred_language')}
              </label>
              <select
                name="preferred_lang"
                value={formData.preferred_lang}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-purple-900">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {t('subscribe.residence_country')}
              </label>
              <select
                name="residence_country"
                value={formData.residence_country}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code} className="bg-purple-900">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                required
              />
              <label className="ml-3 text-sm text-purple-200">
                {t('subscribe.terms_agreement')}
                <a href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline ml-1">
                  {t('subscribe.terms_link')}
                </a>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('subscribe.processing') : t('subscribe.submit_button')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-purple-300 text-sm">
              {t('subscribe.already_member')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {t('subscribe.login_link')}
              </button>
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-white font-semibold mb-3">{t('subscribe.benefits_title')}</h3>
            <ul className="space-y-2 text-purple-200 text-sm">
              <li className="flex items-center">
                <span className="mr-2">💎</span>
                {t('subscribe.benefit_1')}
              </li>
              <li className="flex items-center">
                <span className="mr-2">💬</span>
                {t('subscribe.benefit_2')}
              </li>
              <li className="flex items-center">
                <span className="mr-2">🛍️</span>
                {t('subscribe.benefit_3')}
              </li>
              <li className="flex items-center">
                <span className="mr-2">💍</span>
                {t('subscribe.benefit_4')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;
