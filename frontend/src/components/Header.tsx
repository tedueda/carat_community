import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ChevronDown, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './common/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isFreeUser, logout } = useAuth();
  const { t } = useTranslation();
  
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 未読メッセージ数を取得
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isFreeUser || !user) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const res = await fetch(`${API_URL}/api/matching/chats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const total = data.items?.reduce((sum: number, chat: { unread_count?: number }) => sum + (chat.unread_count || 0), 0) || 0;
          setUnreadCount(total);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // 30秒ごとに更新
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, isFreeUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const boardCategories = [
    { titleKey: "nav.boardCategories.music", link: "/category/music", icon: "🎵" },
    { titleKey: "nav.boardCategories.art", link: "/category/art", icon: "🎨" },
    { titleKey: "nav.boardCategories.comics", link: "/category/comics", icon: "🎭" },
    { titleKey: "nav.boardCategories.food", link: "/category/food", icon: "🍽️" },
    { titleKey: "nav.boardCategories.tourism", link: "/category/tourism", icon: "📍" },
    { titleKey: "nav.boardCategories.boardGeneral", link: "/category/board", icon: "💬" },
    { titleKey: "nav.boardCategories.news", link: "/news", icon: "📰" },
  ];

  const specialMenuItems = [
    { titleKey: "nav.specialMenuItems.matching", link: "/matching", icon: "💕" },
    { titleKey: "nav.specialMenuItems.salon", link: "/salon", icon: "💬" },
    { titleKey: "nav.specialMenuItems.business", link: "/business", icon: "💼" },
    { titleKey: "nav.specialMenuItems.liveWedding", link: "/live-wedding", icon: "💒" },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-black/40">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-5">
        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          <Link to="/feed">
            <img src="/images/logo12.png" alt="Carat Logo" className="h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            {/* 言語セレクター（モバイル） */}
            <LanguageSelector variant="compact" isHomePage={true} />
            {/* チャット通知アイコン（モバイル） */}
            {!isFreeUser && user && (
              <button
                onClick={() => navigate('/matching/chats')}
                className="flex items-center gap-1 px-2 py-1 rounded-full transition-colors hover:bg-black/60 text-white"
                aria-label="チャット"
              >
                <div className="relative">
                  <MessageCircle className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white">
                  {unreadCount > 0 ? '新着' : ''}
                </span>
              </button>
            )}
            {!isFreeUser && user && (
              <span className="text-sm font-medium text-white">{user.display_name}</span>
            )}
            {!isFreeUser && user && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout} 
                className="text-xs px-3 py-1 bg-transparent border-white/30 text-white hover:bg-black/60"
              >
                {t('common.logout')}
              </Button>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg transition-colors text-white hover:bg-black/60"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 pt-4 bg-black/40 rounded-xl shadow-lg mx-2">
            <nav className="flex flex-col space-y-1">
              <Link to="/feed" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-black/60">
                  <Home className="h-5 w-5 mr-2" />
                  {t('nav.home')}
                </Button>
              </Link>
              
              <div className="border-t border-white/20 pt-2 pb-2 mx-2">
                <div className="text-xs font-medium px-4 mb-2 text-white/70">{t('nav.board')}</div>
                {boardCategories.map((category) => (
                  <Link
                    key={category.link}
                    to={category.link}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-white hover:bg-black/60"
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm text-white">{t(category.titleKey)}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/20 pt-2 pb-2 mx-2">
                <div className="text-xs font-medium px-4 mb-2 text-white/70">{t('nav.specialMenu')}</div>
                {specialMenuItems.map((item) => (
                  <Link
                    key={item.link}
                    to={item.link}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-white hover:bg-black/60"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-white">{t(item.titleKey)}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/20 pt-2 pb-2 mx-2">
                <div className="text-xs font-medium px-4 mb-2 text-white/70">{t('nav.account')}</div>
                <Link
                  to="/account"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-white hover:bg-black/60"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm text-white">{t('nav.accountInfo')}</span>
                </Link>
                <Link
                  to="/matching/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-white hover:bg-black/60"
                >
                  <span className="text-xl">✏️</span>
                  <span className="text-sm text-white">{t('nav.profileEdit')}</span>
                </Link>
              </div>

              <div className="mx-2">
                <Link to="/blog" onClick={() => setShowMobileMenu(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-black/60">
                    {t('nav.blog')}
                  </Button>
                </Link>
              </div>

              {(isFreeUser || !user) && (
                <div className="mx-2 pt-2">
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <Button className="w-full bg-black hover:bg-gray-800 text-white">
                      {t('common.login')}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-2 gap-4 items-center">
          {/* Left Column - Logo */}
          <div className="flex justify-start items-start">
            <Link to="/feed" onClick={() => {
              setShowMemberMenu(false);
              setShowBoardMenu(false);
              setShowAccountMenu(false);
            }}>
              <img src="/images/logo12.png" alt="Carat Logo" className="h-28 w-auto" />
            </Link>
          </div>

          {/* Right Column - Navigation (2 rows) */}
          <div className="flex flex-col justify-start items-end space-y-2">
            {/* Top Row - Main Navigation */}
            <nav className="flex items-center gap-8">
              {/* ホーム */}
              <Link to="/feed" onClick={() => {
                setShowMemberMenu(false);
                setShowBoardMenu(false);
                setShowAccountMenu(false);
              }}>
                <Button variant="ghost" className="text-base font-normal px-2 text-white hover:bg-black/60">
                  <Home className="h-5 w-5 mr-2" />
                  {t('nav.home')}
                </Button>
              </Link>
              
              {/* 掲示板 Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-base font-normal px-2 text-white hover:bg-black/60"
                  onClick={() => {
                    setShowBoardMenu(!showBoardMenu);
                    setShowMemberMenu(false);
                    setShowAccountMenu(false);
                  }}
                >
                  {t('nav.board')}
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showBoardMenu && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-black/40 rounded-lg shadow-lg border border-white/20 z-50">
                    <div className="p-2">
                      {boardCategories.map((category) => (
                        <Link
                          key={category.link}
                          to={category.link}
                          onClick={() => setShowBoardMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-black/60 rounded-md transition-colors"
                        >
                          <span className="text-2xl">{category.icon}</span>
                          <span className="text-sm text-white">{t(category.titleKey)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 特別メニュー Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-base font-normal px-2 text-white hover:bg-black/60"
                  onClick={() => {
                    setShowMemberMenu(!showMemberMenu);
                    setShowBoardMenu(false);
                    setShowAccountMenu(false);
                  }}
                >
                  {t('nav.specialMenu')}
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showMemberMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-black/40 rounded-lg shadow-lg border border-white/20 z-50">
                    <div className="p-2">
                      {specialMenuItems.map((item) => (
                        <Link
                          key={item.link}
                          to={item.link}
                          onClick={() => setShowMemberMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-black/60 rounded-md transition-colors"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-sm text-white">{t(item.titleKey)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* アカウント Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-base font-normal px-2 text-white hover:bg-black/60"
                  onClick={() => {
                    setShowAccountMenu(!showAccountMenu);
                    setShowMemberMenu(false);
                    setShowBoardMenu(false);
                  }}
                >
                  {t('nav.account')}
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showAccountMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-black/40 rounded-lg shadow-lg border border-white/20 z-[100]">
                    <div className="p-2">
                      <Link
                        to="/account"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-black/60 rounded-md transition-colors"
                      >
                        <span className="text-2xl">👤</span>
                        <span className="text-sm text-white">{t('nav.accountInfo')}</span>
                      </Link>
                      <Link
                        to="/matching/profile"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-black/60 rounded-md transition-colors"
                      >
                        <span className="text-2xl">✏️</span>
                        <span className="text-sm text-white">{t('nav.profileEdit')}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ブログ */}
              <Link to="/blog" onClick={() => {
                setShowMemberMenu(false);
                setShowBoardMenu(false);
                setShowAccountMenu(false);
              }}>
                <Button variant="ghost" className="text-base font-normal px-2 text-white hover:bg-black/60">
                  {t('nav.blog')}
                </Button>
              </Link>
            </nav>

            {/* Bottom Row - User Info & Auth */}
            <div className="flex items-center gap-4">
              {/* 言語セレクター（デスクトップ） */}
              <LanguageSelector variant="header" isHomePage={true} />
              {isFreeUser || !user ? (
                <Link to="/login">
                  <Button className="text-sm px-6 py-2 bg-transparent border border-white/30 text-white hover:bg-black/60">
                    {t('common.login')}
                  </Button>
                </Link>
              ) : (
                <>
                  {/* チャット通知アイコン（デスクトップ） */}
                  <button
                    onClick={() => navigate('/matching/chats')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:bg-black/60"
                    aria-label={t('header.chat')}
                  >
                    <div className="relative">
                      <MessageCircle className="h-5 w-5 text-white" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white">
                      {unreadCount > 0 
                        ? t('header.unreadMessages', { count: unreadCount })
                        : t('header.chat')}
                    </span>
                  </button>
                  <span className="text-sm text-white">{user.display_name}</span>
                  <Button variant="outline" onClick={handleLogout} className="text-sm px-4 bg-transparent border-white/30 text-white hover:bg-black/60">
                    {t('common.logout')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
