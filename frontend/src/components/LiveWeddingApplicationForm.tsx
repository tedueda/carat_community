import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, Users, Mail, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

interface ApplicationForm {
  applicant1Name: string;
  applicant1Kana: string;
  applicant2Name: string;
  applicant2Kana: string;
  email: string;
  phone: string;
  preferredDate1: string;
  preferredDate2: string;
  preferredDate3: string;
  guestCount: string;
  venue: string;
  backgroundPreference: string;
  message: string;
}

const LiveWeddingApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ApplicationForm>({
    applicant1Name: '',
    applicant1Kana: '',
    applicant2Name: '',
    applicant2Kana: '',
    email: '',
    phone: '',
    preferredDate1: '',
    preferredDate2: '',
    preferredDate3: '',
    guestCount: '',
    venue: '',
    backgroundPreference: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/live-wedding/application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          applicant1Name: '',
          applicant1Kana: '',
          applicant2Name: '',
          applicant2Kana: '',
          email: '',
          phone: '',
          preferredDate1: '',
          preferredDate2: '',
          preferredDate3: '',
          guestCount: '',
          venue: '',
          backgroundPreference: '',
          message: ''
        });
        
        setTimeout(() => {
          navigate('/live-wedding');
        }, 3000);
      } else {
        alert('送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-carat-gray1 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full bg-carat-white border-carat-gray2 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-carat-black mb-4">お申し込みありがとうございます</h2>
              <p className="text-carat-gray6 text-lg mb-6">
                お申し込み内容を受け付けました。<br />
                担当者より3営業日以内にご連絡させていただきます。
              </p>
              <p className="text-carat-gray5 text-sm">
                3秒後に自動的にLive Weddingページに戻ります...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carat-gray1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/live-wedding')}
            className="flex items-center gap-2 text-carat-gray6 hover:text-carat-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Live Weddingページに戻る
          </button>
        </div>

        <Card className="bg-carat-white border-carat-gray2 shadow-lg">
          <CardHeader className="text-center border-b border-carat-gray2 pb-6">
            <h1 className="text-4xl font-bold text-carat-black mb-2">Live Wedding お申し込み</h1>
            <p className="text-carat-gray6">
              以下のフォームにご記入の上、送信してください。<br />
              担当者より詳細なご案内をさせていただきます。
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* お申込者情報 */}
              <div>
                <h3 className="text-2xl font-semibold text-carat-black mb-6 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  お申込者情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      お名前（1）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="applicant1Name"
                      value={formData.applicant1Name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      フリガナ（1）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="applicant1Kana"
                      value={formData.applicant1Kana}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder="ヤマダ タロウ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      お名前（2）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="applicant2Name"
                      value={formData.applicant2Name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder="山田 花子"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      フリガナ（2）<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="applicant2Kana"
                      value={formData.applicant2Kana}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder="ヤマダ ハナコ"
                    />
                  </div>
                </div>
              </div>

              {/* 連絡先情報 */}
              <div>
                <h3 className="text-2xl font-semibold text-carat-black mb-6 flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  連絡先情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      メールアドレス<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      電話番号<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder="090-1234-5678"
                    />
                  </div>
                </div>
              </div>

              {/* 挙式希望日 */}
              <div>
                <h3 className="text-2xl font-semibold text-carat-black mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  挙式希望日
                </h3>
                <p className="text-sm text-carat-gray5 mb-4">第3希望までご記入ください</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      第1希望<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="preferredDate1"
                      value={formData.preferredDate1}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      第2希望
                    </label>
                    <input
                      type="date"
                      name="preferredDate2"
                      value={formData.preferredDate2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      第3希望
                    </label>
                    <input
                      type="date"
                      name="preferredDate3"
                      value={formData.preferredDate3}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                    />
                  </div>
                </div>
              </div>

              {/* 挙式詳細 */}
              <div>
                <h3 className="text-2xl font-semibold text-carat-black mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  挙式詳細
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      参加予定人数<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                    >
                      <option value="">選択してください</option>
                      <option value="10-20">10〜20名</option>
                      <option value="20-30">20〜30名</option>
                      <option value="30-50">30〜50名</option>
                      <option value="50-100">50〜100名</option>
                      <option value="100+">100名以上</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      スタジオQ以外ご要望の場合、ご記入ください
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-carat-gray6 mb-2">
                      背景のご希望
                    </label>
                    <select
                      name="backgroundPreference"
                      value={formData.backgroundPreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                    >
                      <option value="">選択してください</option>
                      <option value="church">教会</option>
                      <option value="resort">海外リゾート</option>
                      <option value="garden">ガーデン</option>
                      <option value="night">夜景</option>
                      <option value="custom">その他（メッセージ欄にご記入ください）</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* メッセージ */}
              <div>
                <h3 className="text-2xl font-semibold text-carat-black mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  ご要望・ご質問
                </h3>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-carat-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-carat-black"
                  placeholder="その他ご要望やご質問がございましたら、こちらにご記入ください。"
                />
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white hover:bg-gray-800 px-12 py-4 text-lg font-semibold inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      お申し込み内容を送信
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-carat-gray5 mt-4">
                送信いただいた情報は、お申し込み対応のみに使用いたします。
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveWeddingApplicationForm;
