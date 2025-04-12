
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface TopNavProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ selectedTab, setSelectedTab }) => {
  const tabs = ['All', 'Music', 'Podcasts', 'Audiobooks'];
  
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
        
        <button className="flex items-center gap-2 bg-black rounded-full py-1 px-1 pr-3 hover:bg-zinc-800">
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
            <User size={14} />
          </div>
          <span className="text-sm font-medium">Profile</span>
        </button>
      </div>
      
      <div className="flex gap-2 px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedTab === tab 
                ? 'bg-white text-black' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopNav;
