
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface TopNavProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ selectedTab, setSelectedTab }) => {
  const tabs = ['Albums', 'Blogs', 'Playlists'];
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath.startsWith('/album')) {
      setSelectedTab('Albums');
    } else if (currentPath === '/blog' || currentPath.startsWith('/blog/')) {
      setSelectedTab('Blogs');
    } else if (currentPath === '/playlists' || currentPath.startsWith('/playlist/')) {
      setSelectedTab('Playlists');
    }
  }, [location.pathname, setSelectedTab]);

  // Responsive: stick to top, shrink if needed, allow scroll on overflow-x, always visible, use min-w for buttons
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-spotify-background/80 pt-4 pb-2">
      <div className="flex items-center gap-2 px-3 sm:px-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <Link 
            key={tab} 
            to={tab === 'Albums' ? '/' : tab === 'Blogs' ? '/blog' : '/playlists'}
            className={`
              px-3 py-2 rounded-full text-xs sm:text-sm font-medium
              ${selectedTab === tab 
                ? 'bg-theme-color text-white' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'}
              min-w-[90px]
            `}
            onClick={() => setSelectedTab(tab)}
            style={{ flex: '0 0 auto' }}
          >
            {tab}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopNav;
