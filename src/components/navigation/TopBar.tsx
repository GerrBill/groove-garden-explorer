
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, Settings } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
    <div className="h-[25px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-1">
        <div className="w-5 h-5">
          <svg viewBox="0 0 24 24" className="w-full h-full text-white">
            <path
              fill="currentColor"
              d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.059 14.406c-.192.233-.53.29-.799.151-2.138-1.285-4.813-1.572-7.965-.862a.595.595 0 0 1-.329-.027.605.605 0 0 1-.274-.177.619.619 0 0 1 .021-.845.583.583 0 0 1 .423-.178c3.466-.83 6.444-.493 8.774.929.271.138.332.475.149.708z"
            />
          </svg>
        </div>
        <span className="text-white text-xs font-bold">Groove</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/" className="text-orange-700 hover:text-white transition-colors">
          <Music size={14} />
        </Link>
        <Link to="/blogs" className="text-orange-700 hover:text-white transition-colors">
          <BookOpen size={14} />
        </Link>
        <Link to="/settings" className="text-orange-700 hover:text-white transition-colors">
          <Settings size={14} />
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
