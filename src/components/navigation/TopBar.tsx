
import React from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import { Link } from "react-router-dom";
import SendEmailDialog from '@/components/email/SendEmailDialog';
import { useSidebar } from "@/components/ui/sidebar";

interface TopBarProps {}

const TopBar: React.FC<TopBarProps> = () => {
  // Use optional chaining to prevent errors if auth context is not available yet
  const auth = useAuth();
  const user = auth?.user;
  const { colorTheme } = useTheme();
  const sidebar = useSidebar();

  return (
    <div className="h-[45px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button 
          className="mr-3 text-white hover:text-theme-color"
          onClick={() => {
            console.log("Toggle sidebar clicked");
            sidebar.setOpen(!sidebar.open);
          }}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        
        <Link to="/" className="h-[18px] flex items-center hover:opacity-80 transition-opacity">
          <img 
            src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" 
            alt="Gerrbill Media" 
            className="h-full" 
            onError={(e) => {
              console.error("Logo failed to load");
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <>
            <Link to="/settings" className="text-white hover:text-theme-color transition-colors">
              <Settings size={18} />
            </Link>
            <SendEmailDialog />
          </>
        )}
        
        <div className="text-white">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
