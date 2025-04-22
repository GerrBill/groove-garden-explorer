
import React from 'react';
// Removed: Music, BookOpen, ListMusic icons.
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import SendEmailDialog from '@/components/email/SendEmailDialog';

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
        <SendEmailDialog />

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
        
        {user && (
          <a href="/settings" className="text-theme-color hover:text-white transition-colors">
            <Settings size={18} />
          </a>
        )}
        
        <div className="text-white">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
