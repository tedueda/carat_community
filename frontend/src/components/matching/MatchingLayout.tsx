import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import { Search, Heart, MessageCircle, User } from 'lucide-react';

const MatchingLayout: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      
      try {
        const res = await fetch(`${API_URL}/api/matching/chat_requests/incoming`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          const incomingCount = data.items?.length || 0;
          setUnreadCount(incomingCount);
        }
      } catch (e) {
        console.error('Failed to fetch unread count:', e);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      {/* Mobile Navigation - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 flex gap-2 bg-gray-700 px-3 py-3 justify-around z-40 shadow-lg">

        <NavLink 
          to="/matching" 
          end 
          className={({ isActive }) => `flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-full ${isActive ? 'bg-white text-black' : 'text-gray-300'}`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">{t('matching.nav.search')}</span>
        </NavLink>
        <NavLink 
          to="/matching/likes" 
          className={({ isActive }) => `flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-full ${isActive ? 'bg-white text-black' : 'text-gray-300'}`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">{t('matching.nav.favorites')}</span>
        </NavLink>
        <NavLink 
          to="/matching/chats" 
          className={({ isActive }) => `flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-full relative ${isActive ? 'bg-white text-black' : 'text-gray-300'}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs mt-1">{t('matching.nav.chats')}</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
        <NavLink 
          to="/matching/profile" 
          className={({ isActive }) => `flex flex-col items-center justify-center px-3 py-2 transition-colors rounded-full ${isActive ? 'bg-white text-black' : 'text-gray-300'}`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{t('matching.nav.edit')}</span>
        </NavLink>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-2xl font-bold text-black mb-4 hidden md:block">{t('matching.pageTitle')}</h1>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3 mb-6 bg-gray-700 rounded-lg px-2 py-1 justify-end">
          <NavLink to="/matching" end className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>{t('matching.nav.search')}</NavLink>
          <NavLink to="/matching/likes" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>{t('matching.nav.favorites')}</NavLink>
          <NavLink to="/matching/chats" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md relative ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>
            {t('matching.nav.chats')}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/matching/profile" className={({ isActive }) => `px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}>{t('matching.nav.editProfile')}</NavLink>
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default MatchingLayout;
