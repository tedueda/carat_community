import React from 'react';
import { Palette } from 'lucide-react';

const ArtSaleList: React.FC = () => {
  return (
    <div className="text-center py-16">
      <Palette className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-600 mb-2">作品販売</h3>
      <p className="text-gray-500">近日公開予定</p>
    </div>
  );
};

export default ArtSaleList;
