import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Palette, GraduationCap, Radio } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FleaMarketList from '../../components/flea-market/FleaMarketList';
import ArtSaleList from '../../components/art-sales/ArtSaleList';

type TabType = 'flea-market' | 'art-sales' | 'courses' | 'live-streaming';

const tabs: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'flea-market', label: 'フリマ', icon: <ShoppingBag className="w-5 h-5" />, description: 'ジモティー風の個人間売買' },
  { id: 'art-sales', label: '作品販売', icon: <Palette className="w-5 h-5" />, description: 'アート作品の販売' },
  { id: 'courses', label: '講座', icon: <GraduationCap className="w-5 h-5" />, description: 'オンライン講座' },
  { id: 'live-streaming', label: 'Live配信', icon: <Radio className="w-5 h-5" />, description: 'ライブ配信サービス' },
];

const BusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'flea-market';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'flea-market':
        return <FleaMarketList />;
      case 'art-sales':
        return <ArtSaleList />;
      case 'courses':
        return (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">講座</h3>
            <p className="text-gray-500">近日公開予定</p>
          </div>
        );
      case 'live-streaming':
        return (
          <div className="text-center py-16">
            <Radio className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Live配信</h3>
            <p className="text-gray-500">近日公開予定</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/feed')}
              className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">ビジネス</h1>
            <p className="text-xl text-gray-600">フリマ・作品販売・講座・Live配信</p>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {renderTabContent()}
        </div>
      </section>
    </div>
  );
};

export default BusinessPage;
