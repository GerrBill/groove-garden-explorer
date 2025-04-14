
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface TopNavProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ selectedTab, setSelectedTab }) => {
  const tabs = ['Music', 'Blogs'];
  const location = useLocation();
  
  // Determine current page based on location
  React.useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath.startsWith('/album')) {
      setSelectedTab('Music');
    } else if (currentPath === '/blog' || currentPath.startsWith('/blog/')) {
      setSelectedTab('Blogs');
    }
  }, [location.pathname, setSelectedTab]);
  
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-spotify-background/80 pt-4 pb-2">
      <div className="flex items-center gap-2 px-6">
        {tabs.map((tab) => (
          <Link 
            key={tab} 
            to={tab === 'Music' ? '/' : '/blog'}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedTab === tab 
                ? 'bg-orange-800 text-white' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopNav;
