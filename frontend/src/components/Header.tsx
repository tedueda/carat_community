import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ChevronDown, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './common/LanguageSelector';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isFreeUser, logout } = useAuth();
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

  const memberBenefits = [
    { title: "マッチング", link: "/matching", icon: "💕" },
    { title: "ライブ・ウエディング", link: "/live-wedding", icon: "💒" },
    { title: "寄付金を募る", link: "/funding", icon: "🤝" },
    { title: "マーケット", link: "/marketplace", icon: "🛍️" },
    { title: "お気に入り", link: "/members/favorites", icon: "❤️" },
    { title: "食レポ", link: "/members/food", icon: "🍽" },
    { title: "ビューティ", link: "/members/beauty", icon: "💄" },
  ];

  const boardCategories = [
    { title: "サブカルチャー", link: "/board/subculture", icon: "🎮" },
    { title: "アート", link: "/board/art", icon: "🎨" },
    { title: "音楽", link: "/board/music", icon: "🎵" },
    { title: "掲示板", link: "/board/general", icon: "💬" },
    { title: "お店", link: "/board/shops", icon: "🏪" },
    { title: "ツーリズム", link: "/board/tourism", icon: "✈️" },
  ];

  return (
    <header className="bg-transparent backdrop-blur-md shadow-2xl border-b border-gray-300/50 relative z-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-5">
        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          <Link to="/feed">
            <img src="/images/logo02.png" alt="Carat Logo" className="h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            {/* 言語セレクター（モバイル） */}
            <LanguageSelector variant="compact" />
            {/* チャット通知アイコン（モバイル） */}
            {!isFreeUser && user && (
              <button
                onClick={() => navigate('/matching/chats')}
                className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="チャット"
              >
                <div className="relative">
                  <MessageCircle className="h-5 w-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-600">
                  {unreadCount > 0 ? '新着' : ''}
                </span>
              </button>
            )}
            {!isFreeUser && user && (
              <span className="text-sm text-gray-700 font-medium">{user.display_name}</span>
            )}
            {!isFreeUser && user && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout} 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1"
              >
                ログアウト
              </Button>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/feed" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-black hover:bg-gray-50">
                  <Home className="h-5 w-5 mr-2" />
                  ホーム
                </Button>
              </Link>
              
              <div className="border-t border-gray-100 pt-2 pb-2">
                <div className="text-xs text-gray-500 font-medium px-4 mb-2">会員特典メニュー</div>
                {memberBenefits.map((benefit) => (
                  <Link
                    key={benefit.link}
                    to={benefit.link}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-xl">{benefit.icon}</span>
                    <span className="text-sm text-gray-700">{benefit.title}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-2 pb-2">
                <div className="text-xs text-gray-500 font-medium px-4 mb-2">掲示板</div>
                {boardCategories.map((category) => (
                  <Link
                    key={category.link}
                    to={category.link}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm text-gray-700">{category.title}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-2 pb-2">
                <div className="text-xs text-gray-500 font-medium px-4 mb-2">アカウント</div>
                <Link
                  to="/account"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm text-gray-700">アカウント情報</span>
                </Link>
                <Link
                  to="/matching/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="text-xl">✏️</span>
                  <span className="text-sm text-gray-700">プロフィール編集</span>
                </Link>
              </div>

              <Link to="/blog" onClick={() => setShowMobileMenu(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-black hover:bg-gray-50">
                  ブログ
                </Button>
              </Link>

              {(isFreeUser || !user) && (
                <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white">
                    ログイン
                  </Button>
                </Link>
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
              <img src="/images/logo02.png" alt="Carat Logo" className="h-28 w-auto" />
            </Link>
          </div>

          {/* Right Column - Navigation (2 rows) */}
          <div className="flex flex-col justify-start items-end space-y-2">
            {/* Top Row - Main Navigation */}
            <nav className="flex items-center gap-8">
              <Link to="/feed" onClick={() => {
                setShowMemberMenu(false);
                setShowBoardMenu(false);
                setShowAccountMenu(false);
              }}>
                <Button variant="ghost" className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2">
                  <Home className="h-5 w-5 mr-2" />
                  ホーム
                </Button>
              </Link>
              
              {/* Member Benefits Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2"
                  onClick={() => {
                    setShowMemberMenu(!showMemberMenu);
                    setShowBoardMenu(false);
                    setShowAccountMenu(false);
                  }}
                >
                  会員特典メニュー
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showMemberMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      {memberBenefits.map((benefit) => (
                        <Link
                          key={benefit.link}
                          to={benefit.link}
                          onClick={() => setShowMemberMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <span className="text-2xl">{benefit.icon}</span>
                          <span className="text-sm text-gray-700">{benefit.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Board Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2"
                  onClick={() => {
                    setShowBoardMenu(!showBoardMenu);
                    setShowMemberMenu(false);
                    setShowAccountMenu(false);
                  }}
                >
                  掲示板
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showBoardMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      {boardCategories.map((category) => (
                        <Link
                          key={category.link}
                          to={category.link}
                          onClick={() => setShowBoardMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <span className="text-2xl">{category.icon}</span>
                          <span className="text-sm text-gray-700">{category.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2"
                  onClick={() => {
                    setShowAccountMenu(!showAccountMenu);
                    setShowMemberMenu(false);
                    setShowBoardMenu(false);
                  }}
                >
                  アカウント
                  <ChevronDown className="h-5 w-5 ml-1" />
                </Button>
                
                {showAccountMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]">
                    <div className="p-2">
                      <Link
                        to="/account"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <span className="text-2xl">👤</span>
                        <span className="text-sm text-gray-700">アカウント情報</span>
                      </Link>
                      <Link
                        to="/matching/profile"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <span className="text-2xl">✏️</span>
                        <span className="text-sm text-gray-700">プロフィール編集</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/blog" onClick={() => {
                setShowMemberMenu(false);
                setShowBoardMenu(false);
                setShowAccountMenu(false);
              }}>
                <Button variant="ghost" className="text-gray-700 hover:text-black hover:bg-gray-50 text-base font-normal px-2">
                  ブログ
                </Button>
              </Link>
            </nav>

            {/* Bottom Row - User Info & Auth */}
            <div className="flex items-center gap-4">
              {/* 言語セレクター（デスクトップ） */}
              <LanguageSelector variant="header" />
              {isFreeUser || !user ? (
                <Link to="/login">
                  <Button className="bg-black hover:bg-gray-800 text-white text-sm px-6 py-2">
                    ログイン
                  </Button>
                </Link>
              ) : (
                <>
                  {/* チャット通知アイコン（デスクトップ） */}
                  <button
                    onClick={() => navigate('/matching/chats')}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="チャット"
                  >
                    <div className="relative">
                      <MessageCircle className="h-5 w-5 text-gray-700" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {unreadCount > 0 
                        ? `未読${unreadCount}件` 
                        : 'チャット'}
                    </span>
                  </button>
                  <span className="text-sm text-gray-600">{user.display_name}</span>
                  <Button variant="outline" onClick={handleLogout} className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-4">
                    ログアウト
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
