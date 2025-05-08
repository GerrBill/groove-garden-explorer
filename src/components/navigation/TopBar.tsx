
import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import { Link } from "react-router-dom";

interface TopBarProps {}

const TopBar: React.FC<TopBarProps> = () => {
  const { user } = useAuth();
  const { colorTheme } = useTheme();

  // Add meta viewport tag for better fullscreen control
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  return (
    <div className="h-[45px] w-full bg-black border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <Link to="/" className="h-[18px] flex items-center hover:opacity-80 transition-opacity">
          <img src="/lovable-uploads/8b5edd18-788f-4777-a313-70ccc56e19cf.png" alt="Gerrbill Media" className="h-full" />
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
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
