
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

  // Responsive: buttons spaced 5px apart horizontally, compact design for mobile
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-black pt-3 pb-1">
      <div className="flex items-center gap-x-1 px-2 sm:px-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <Link 
            key={tab} 
            to={tab === 'Albums' ? '/' : tab === 'Blogs' ? '/blog' : '/playlists'}
            className={`
              px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mx-0.5
              ${selectedTab === tab 
                ? 'bg-theme-color text-white' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'}
              min-w-[72px] sm:min-w-[90px]
            `}
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
