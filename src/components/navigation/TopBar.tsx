
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, ListMusic, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';

interface TopBarProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { colorTheme } = useTheme();
  
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
        <Link to="/" className="text-theme-color hover:text-white transition-colors">
          <Music size={18} />
        </Link>
        
        <Link to="/blog" className="text-theme-color hover:text-white transition-colors">
          <BookOpen size={18} />
        </Link>

        <Link to="/playlists" className="text-theme-color hover:text-white transition-colors">
          <ListMusic size={18} />
        </Link>

        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="text-theme-color hover:text-white transition-colors"
            aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarOpen ? 
              <ChevronLeft size={18} /> : 
              <ChevronRight size={18} />
            }
          </button>
        )}
        
        {/* Make Settings icon clickable with link to settings page */}
        {user && (
          <Link to="/settings" className="text-theme-color hover:text-white transition-colors">
            <Settings size={18} />
          </Link>
        )}
        
        {/* Account button with white color */}
        <div className="text-white">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
