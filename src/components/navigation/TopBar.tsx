import React from 'react';
import { Link } from 'react-router-dom';
import { Music, BookOpen, ListMusic, Settings, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AccountButton from '@/components/auth/AccountButton';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TopBarProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { colorTheme } = useTheme();

  const sendTestEmail = async () => {
    try {
      toast.loading("Sending test email...");
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'ghodgett59@gmail.com',
          subject: 'Hello Geraldo, How was Madrid??',
          html: '<strong><h1>This was sent from the gerrbill.com website</h1><br>its just a test...</strong>'
        },
      });

      if (error) throw error;

      toast.success("Test email sent successfully!");
      console.log('Email sent:', data);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("Failed to send test email");
    }
  };
  
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={sendTestEmail}
                className="text-theme-color hover:text-white transition-colors"
                aria-label="Send test email"
              >
                <Mail size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send test email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
          <Link to="/settings" className="text-theme-color hover:text-white transition-colors">
            <Settings size={18} />
          </Link>
        )}
        
        <div className="text-white">
          <AccountButton />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
