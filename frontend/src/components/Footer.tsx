import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const AccordionSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm font-semibold text-white"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14">

        {/* PC: 3-column */}
        <div className="hidden md:grid md:grid-cols-3 gap-12">
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">運営情報</h4>
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
              <p className="font-medium text-gray-300">ポテンシャルデザイン</p>
              <p>運営責任者：上田 孝久</p>
              <p>〒545-0021 大阪府大阪市阿倍野区阪南町6-1-5</p>
              <p>TEL：<a href="tel:06-6697-0034" className="hover:text-white transition-colors">06-6697-0034</a></p>
              <p>Mail：<a href="mailto:ted@carat-community.com" className="hover:text-white transition-colors">ted@carat-community.com</a></p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">サイト案内</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">Caratとは</Link></li>
              <li><Link to="/about/usage" className="text-gray-400 hover:text-white transition-colors">ご利用方法</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">法務・規約</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about/terms" className="text-gray-400 hover:text-white transition-colors">利用規約</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link to="/about/tokushoho" className="text-gray-400 hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
            </ul>
          </div>
        </div>

        {/* SP: Accordion */}
        <div className="md:hidden space-y-0">
          <AccordionSection title="運営情報">
            <div className="space-y-2 text-sm text-gray-400 leading-relaxed pl-1">
              <p className="font-medium text-gray-300">ポテンシャルデザイン</p>
              <p>運営責任者：上田 孝久</p>
              <p>〒545-0021 大阪府大阪市阿倍野区阪南町6-1-5</p>
              <p>TEL：<a href="tel:06-6697-0034" className="hover:text-white transition-colors">06-6697-0034</a></p>
              <p>Mail：<a href="mailto:ted@carat-community.com" className="hover:text-white transition-colors">ted@carat-community.com</a></p>
            </div>
          </AccordionSection>

          <AccordionSection title="サイト案内">
            <ul className="space-y-3 text-sm pl-1">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">Caratとは</Link></li>
              <li><Link to="/about/usage" className="text-gray-400 hover:text-white transition-colors">ご利用方法</Link></li>
            </ul>
          </AccordionSection>

          <AccordionSection title="法務・規約">
            <ul className="space-y-3 text-sm pl-1">
              <li><Link to="/about/terms" className="text-gray-400 hover:text-white transition-colors">利用規約</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link to="/about/tokushoho" className="text-gray-400 hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
            </ul>
          </AccordionSection>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500 space-y-1">
          <p>&copy; {new Date().getFullYear()} Potential Design. All rights reserved.</p>
          <p>推奨動作環境：Chrome / Safari / Edge / Firefox（最新版推奨）</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
