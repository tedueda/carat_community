import React from 'react';
import { X } from 'lucide-react';

interface UnderConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnderConstructionModal: React.FC<UnderConstructionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-pink-800 mb-4">只今、制作中</h2>
          <p className="text-gray-600 mb-6">
            この機能は現在開発中です。<br />
            より良いサービスを提供するため、<br />
            新しく作り直しております。
          </p>
          <p className="text-sm text-gray-500 mb-6">
            完成まで今しばらくお待ちください。
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderConstructionModal;
