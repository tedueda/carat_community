import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { resilientFetch } from '@/contexts/AuthContext';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await resilientFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('sent');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-16 right-[-120px] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Mail className="h-4 w-4" />
              Carat Community
            </div>
            <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-white">
              お問い合わせ
            </h1>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {status === 'sent' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">送信完了</h2>
              <p className="text-gray-600 mb-8">
                お問い合わせありがとうございます。内容を確認の上、折り返しご連絡いたします。
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                新しいお問い合わせ
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm md:text-base text-gray-600 mb-8">
                ご質問・ご意見・お問い合わせは、下記フォームまたはメール（<a href="mailto:ted@carat-community.com" className="text-blue-600 hover:underline">ted@carat-community.com</a>）にてお気軽にどうぞ。
              </p>

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">送信に失敗しました。お手数ですが、メール（<a href="mailto:ted@carat-community.com" className="underline">ted@carat-community.com</a>）にて直接ご連絡ください。</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">お名前</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">メールアドレス</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">件名</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="サービスについて">サービスについて</option>
                    <option value="アカウントについて">アカウントについて</option>
                    <option value="決済・お支払いについて">決済・お支払いについて</option>
                    <option value="不具合・バグ報告">不具合・バグ報告</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">お問い合わせ内容</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-vertical"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  お問い合わせの際は、<Link to="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>をご確認ください。
                </p>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? '送信中...' : '送信する'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
