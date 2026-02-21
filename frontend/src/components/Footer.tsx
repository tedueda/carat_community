import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Carat Community</h3>
            <p className="text-gray-400 text-sm">
              {t('footer.description', 'LGBTQフレンドリーなコミュニティプラットフォーム')}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.about', 'サイトについて')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">{t('footer.aboutUs', '私たちについて')}</Link></li>
              <li><Link to="/about/terms" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms', '利用規約')}</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy', 'プライバシーポリシー')}</Link></li>
              <li><Link to="/about/tokushoho" className="text-gray-400 hover:text-white transition-colors">{t('footer.tokushoho', '特定商取引法に基づく表記')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.community', 'コミュニティ')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/board" className="text-gray-400 hover:text-white transition-colors">{t('nav.boardCategories.boardGeneral', '掲示板')}</Link></li>
              <li><Link to="/news" className="text-gray-400 hover:text-white transition-colors">{t('nav.boardCategories.news', 'LGBTQ+ニュース')}</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">{t('nav.blog', 'ブログ')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4">{t('footer.support', 'サポート')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact', 'お問い合わせ')}</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">{t('footer.faq', 'よくある質問')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Carat Community. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
