import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

const VirtualWeddingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // const features = [
  //   {
  //     icon: <Globe className="w-8 h-8" />,
  //     title: "世界中に配信",
  //     description: "距離を超えて、大切な人たちと特別な瞬間を共有"
  //   },
  //   {
  //     icon: <Camera className="w-8 h-8" />,
  //     title: "プロの撮影",
  //     description: "経験豊富なカメラマンが美しい映像を提供"
  //   },
  //   {
  //     icon: <Users className="w-8 h-8" />,
  //     title: "専任サポート",
  //     description: "当日まで専任スタッフが丁寧にサポート"
  //   },
  //   {
  //     icon: <Heart className="w-8 h-8" />,
  //     title: "思い出を永遠に",
  //     description: "録画データをお渡しし、いつでも振り返れます"
  //   }
  // ];

  return (
    <div className="min-h-screen bg-carat-gray1">
      {/* Hero Section with Background Video - Full Width */}
      <div className="relative w-full h-[850px] flex items-center justify-center overflow-hidden">
          {/* Background Video */}
          <video 
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="https://test.studioq.co.jp/wp-content/uploads/2025/11/VW3.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Content */}
          <div className="relative z-10 text-white px-4 w-full h-full flex flex-col">
            {/* ホームに戻るボタン */}
            <div className="pt-6 pl-4">
              <button
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full"
              >
                <Home className="h-5 w-5" />
                {t('liveWedding.page.backToHome')}
              </button>
            </div>

            {/* Top Section - キャッチ */}
            <div className="flex-1 flex flex-col justify-start pt-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center">
                {t('liveWedding.page.title')}
              </h1>
              <p className="text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed text-center">
                {t('liveWedding.page.subtitle')}
              </p>
            </div>
            
            {/* Bottom Section - ボタン */}
            <div className="pb-16 text-center">
              <Button 
                onClick={() => {
                  navigate('/live-wedding/application');
                  window.scrollTo(0, 0);
                }}
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-xl font-semibold transition-colors"
              >
                {t('liveWedding.page.consultationButton')}
              </Button>
            </div>
          </div>
        </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Concept Section */}
        <div className="mb-16 pt-16">
          <div className="max-w-4xl mx-auto bg-carat-white rounded-2xl border border-carat-gray2 shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
            <h2 className="text-3xl font-bold text-center text-carat-black mb-8">{t('liveWedding.page.conceptTitle')}</h2>
            <div className="mb-8">
              <p className="text-xl text-carat-gray6 leading-relaxed">
                {t('liveWedding.page.conceptDescription')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-carat-black mb-4">{t('liveWedding.page.recommendTitle')}</h3>
              <ul className="space-y-3 text-carat-gray6 text-lg">
                {(t('liveWedding.page.recommendReasons', { returnObjects: true }) as string[]).map((reason: string, index: number) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-carat-black mb-12">{t('liveWedding.page.featuresTitle')}</h2>
          <div className="max-w-4xl mx-auto bg-carat-white rounded-2xl border border-carat-gray2 shadow-card p-8">
            <p className="text-carat-gray6 leading-relaxed text-xl">
              {t('liveWedding.page.featuresDescription')}
            </p>
          </div>
        </div>

        {/* Single Plan Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-carat-black mb-12">{t('liveWedding.page.pricingTitle')}</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-carat-white border-carat-gray2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <h3 className="text-3xl font-bold text-carat-black mb-2">{t('liveWedding.page.planTitle')}</h3>
                <p className="text-carat-gray5 text-lg mb-2">
                  <span className="line-through">{t('liveWedding.page.regularPrice')} ¥500,000</span>
                </p>
                <p className="text-4xl font-bold text-carat-black">¥300,000</p>
                <p className="text-carat-gray5 mt-2">{t('liveWedding.page.taxExcluded')}</p>
                <div className="mt-4 px-4 py-2 bg-carat-black text-carat-white rounded-full inline-block">
                  <span className="text-sm font-semibold">{t('liveWedding.page.memberPrice')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 含まれる内容 */}
                  <div>
                    <h4 className="text-xl font-semibold text-carat-black mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      {t('liveWedding.page.includedTitle')}
                    </h4>
                    <ul className="space-y-2">
                      {(t('liveWedding.page.includedFeatures', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-carat-gray6 text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* 含まれない内容 */}
                  <div>
                    <h4 className="text-xl font-semibold text-carat-black mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('liveWedding.page.notIncludedTitle')}
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {(t('liveWedding.page.notIncludedFeatures', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-carat-gray6 text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-carat-gray5 text-sm">{t('liveWedding.page.notIncludedNote')}</p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => {
                      navigate('/live-wedding/application');
                      window.scrollTo(0, 0);
                    }}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold"
                  >
                    {t('liveWedding.page.applyButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Background Composite Video Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-carat-black mb-12">{t('liveWedding.page.videoTitle')}</h2>
          <div className="max-w-4xl mx-auto bg-carat-white rounded-2xl border border-carat-gray2 shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
            <div 
              className="aspect-video rounded-xl overflow-hidden mb-6 cursor-pointer relative group"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <video 
                className="w-full h-full object-cover"
                muted
                poster=""
              >
                <source src="https://test.studioq.co.jp/wp-content/uploads/2025/11/バーチャルウェディング（DEMO.mp4" type="video/mp4" />
              </video>
              {/* 再生ボタンオーバーレイ */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-transparent border-2 border-white rounded-full p-6 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-carat-black mb-4">{t('liveWedding.page.videoSubtitle')}</h3>
            <p className="text-carat-gray6 leading-relaxed text-lg">
              {t('liveWedding.page.videoDescription')}
            </p>
          </div>
        </div>

        {/* Studio Q Link Banner */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <a 
              href="https://studioq.co.jp/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-carat-white rounded-2xl border border-carat-gray2 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-carat-black rounded-full flex items-center justify-center">
                      <span className="text-carat-white font-bold text-xl">Q</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-carat-black group-hover:text-carat-gray6 transition-colors">
                        {t('liveWedding.page.studioQTitle')}
                      </h3>
                      <p className="text-carat-gray5">{t('liveWedding.page.studioQSubtitle')}</p>
                    </div>
                  </div>
                  <p className="text-carat-gray6 leading-relaxed mb-4 text-lg">
                    {t('liveWedding.page.studioQDescription')}
                  </p>
                  <div className="flex items-center gap-2 text-carat-gray5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('liveWedding.page.studioQLocation')}</span>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="w-12 h-12 bg-carat-gray1 rounded-full flex items-center justify-center group-hover:bg-carat-black transition-colors">
                    <svg className="w-6 h-6 text-carat-gray6 group-hover:text-carat-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-carat-black mb-12">{t('liveWedding.page.faqTitle')}</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {(t('liveWedding.page.faqs', { returnObjects: true }) as Array<{question: string; answer: string}>).map((faq, index) => (
              <Card key={index} className="bg-carat-white border-carat-gray2 shadow-card">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-carat-gray1 transition-colors"
                >
                  <span className="font-semibold text-carat-black">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-carat-gray5" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-carat-gray5" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-carat-gray6 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl w-full">
            {/* 閉じるボタン */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-carat-gray2 transition-colors"
              aria-label={t('liveWedding.page.closeVideo')}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* 動画 */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                autoPlay
              >
                <source src="https://test.studioq.co.jp/wp-content/uploads/2025/11/バーチャルウェディング（DEMO.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualWeddingPage;
