
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, ListMusic, Settings, ChevronLeft, ChevronRight, User, List } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';
import AccountButton from '@/components/auth/AccountButton';

interface TopBarProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
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
        
        <Link to="/blog" className="text-orange-700 hover:text-white transition-colors">
          <BookOpen size={18} />
        </Link>

        <Link to="/playlists" className="text-orange-700 hover:text-white transition-colors">
          <ListMusic size={18} />
        </Link>

        <Link to="/playlists" className="text-orange-700 hover:text-white transition-colors">
          <List size={18} />
        </Link>

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
        
        {/* Only show Settings icon to logged-in users */}
        {user ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-orange-700 hover:text-white transition-colors cursor-not-allowed">
                <Settings size={18} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-[#FEF7CD] border-zinc-800 text-[#ea384c] font-bold px-4 py-3 text-base">
              <p>FFS give me a chance...</p>
            </TooltipContent>
          </Tooltip>
        ) : null}
        
        {/* Account button with white color */}
        <div className="text-white">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
