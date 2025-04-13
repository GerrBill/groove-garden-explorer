import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AlbumNavigationProps {
  onGoBack: () => void;
}

const AlbumNavigation: React.FC<AlbumNavigationProps> = ({ onGoBack }) => {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-transparent pt-4">
      <div className="flex justify-between items-center px-6 mb-4">
        <div className="flex gap-2">
          <button 
            className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full"
            onClick={onGoBack}
          >
            <ChevronLeft size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
            <ChevronRight size={18} />
          </button>
        </div>
        
        {/* Profile link removed */}
      </div>
    </div>
  );
};

export default AlbumNavigation;
