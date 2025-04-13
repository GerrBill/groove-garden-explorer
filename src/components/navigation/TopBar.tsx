
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopBarProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <div className="h-[35px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="h-[14px] flex items-center">
          <img 
            src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" 
            alt="Gerrbill Media" 
            className="h-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="text-orange-700 hover:text-white transition-colors"
            aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarOpen ? 
              <ChevronLeft size={14} /> : 
              <ChevronRight size={14} />
            }
          </button>
        )}
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
