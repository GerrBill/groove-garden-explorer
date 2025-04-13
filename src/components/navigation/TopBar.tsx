
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopBarProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <div className="h-[45px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="h-[18px] flex items-center">
          <img 
            src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" 
            alt="Gerrbill Media" 
            className="h-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/" className="text-orange-700 hover:text-white transition-colors">
          <Music size={18} />
        </Link>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/blogs" className="text-orange-700 hover:text-white transition-colors">
              <BookOpen size={18} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
            <p>FFS give me a chance...</p>
          </TooltipContent>
        </Tooltip>
        
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="text-orange-700 hover:text-white transition-colors"
            aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarOpen ? 
              <ChevronLeft size={18} /> : 
              <ChevronRight size={18} />
            }
          </button>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/settings" className="text-orange-700 hover:text-white transition-colors">
              <Settings size={18} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
            <p>FFS give me a chance...</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default TopBar;
