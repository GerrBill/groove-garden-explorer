
import React from 'react';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import SendEmailDialog from '@/components/email/SendEmailDialog';
import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

interface TopBarProps {}

const TopBar: React.FC<TopBarProps> = () => {
  const { user } = useAuth();
  const { colorTheme } = useTheme();
  const { open: sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="h-[45px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <Link to="/" className="h-[18px] flex items-center hover:opacity-80 transition-opacity">
          <img src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" alt="Gerrbill Media" className="h-full" />
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <SendEmailDialog />

        <button 
          onClick={toggleSidebar} 
          className="text-theme-color hover:text-white transition-colors" 
          aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarOpen ? <ChevronLeft size={18} className="mx-[20px]" /> : <ChevronRight size={18} />}
        </button>
        
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
