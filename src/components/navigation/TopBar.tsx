
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, Settings } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
    <div className="h-[30px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="h-[19px] flex items-center">
          <img 
            src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" 
            alt="Gerrbill Media" 
            className="h-full"
          />
        </div>
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
