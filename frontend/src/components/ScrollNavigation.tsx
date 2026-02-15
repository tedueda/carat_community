import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollNavigation: React.FC = () => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show buttons when scrolled down more than 300px
      setShowButtons(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!showButtons) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="bg-gray-800/90 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="トップへ戻る"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      
      {/* Scroll to Bottom Button */}
      <button
        onClick={scrollToBottom}
        className="bg-gray-800/90 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="ボトムへ移動"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ScrollNavigation;
