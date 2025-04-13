
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AddAlbumDialog from '@/components/album/AddAlbumDialog';
import { Button } from "@/components/ui/button";
import AccountButton from '@/components/auth/AccountButton';
import { useAuth } from '@/context/AuthContext';

interface TopNavProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  onAlbumAdded?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ selectedTab, setSelectedTab, onAlbumAdded }) => {
  const tabs = ['All', 'Music', 'Blogs'];
  const { user } = useAuth();
  
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-spotify-background/80 pt-4 pb-2">
      <div className="flex justify-between items-center px-6 mb-4">
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
            <ChevronLeft size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
            <ChevronRight size={18} />
          </button>
        </div>
        
        <AccountButton />
      </div>
      
      <div className="flex items-center gap-2 px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedTab === tab 
                ? 'bg-orange-700 text-white' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
        
        {/* Only show Add Album button to logged-in users */}
        {user && (
          <div className="ml-3">
            <AddAlbumDialog onAlbumAdded={onAlbumAdded}>
              <Button size="sm" className="flex items-center gap-1 rounded-full">
                <Plus size={16} />
                Add Album
              </Button>
            </AddAlbumDialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNav;
