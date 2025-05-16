
import { useCallback, useState } from 'react';
import { Menu, X } from 'lucide-react';
import AccountButton from '../auth/AccountButton';
import { Link } from 'react-router-dom';
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from '@/hooks/use-mobile';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const [selectedTab, setSelectedTab] = useState('Albums');
  const isMobile = useIsMobile(700);
  const { open: sidebarOpen } = useSidebar();
  
  console.log("TopBar rendering, sidebarOpen:", sidebarOpen, "isMobile:", isMobile);
  
  const handleToggleSidebar = useCallback(() => {
    console.log("Toggle sidebar clicked");
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  }, [onToggleSidebar]);

  return (
    <div className="sticky top-0 z-30 w-full flex bg-black items-center justify-between px-4 py-1 border-b border-zinc-800">
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleToggleSidebar} 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <Link to="/" className="text-lg font-bold text-theme-color">
          GerrBill Notify
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <AccountButton />
      </div>
    </div>
  );
};

export default TopBar;
