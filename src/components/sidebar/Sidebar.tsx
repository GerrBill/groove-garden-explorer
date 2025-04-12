
import { Search, Library, Heart, Book } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { useState } from "react";

const Sidebar = () => {
  const [activeFilter, setActiveFilter] = useState('Playlists');
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };
  
  return (
    <div className="w-64 h-screen bg-black flex flex-col border-r border-zinc-800 flex-shrink-0 transition-all duration-300 md:translate-x-0 sm:w-56 xs:w-48 absolute md:relative z-20 transform -translate-x-full md:translate-x-0">
      <div className="p-4 flex flex-col gap-4">
        <SidebarItem icon={<Library />} text="Your Library" />
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1 w-full">
            <button 
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex-1 ${
                activeFilter === 'Playlists' 
                  ? 'bg-orange-700 text-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleFilterClick('Playlists')}
            >
              Playlists
            </button>
            <button 
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex-1 ${
                activeFilter === 'Albums' 
                  ? 'bg-orange-700 text-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleFilterClick('Albums')}
            >
              Albums
            </button>
            <button 
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex-1 ${
                activeFilter === 'Blogs' 
                  ? 'bg-orange-700 text-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleFilterClick('Blogs')}
            >
              Blogs
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button className="p-2 rounded-full hover:bg-zinc-800">
            <Search size={20} className="text-spotify-text-secondary" />
          </button>
          <button className="flex items-center gap-1 text-spotify-text-secondary text-sm hover:text-white">
            Recents
            <span className="text-xs">▾</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow px-2">
        <SidebarPlaylist 
          name="Liked Songs" 
          icon={<Heart className="text-orange-700" size={18} />} 
          type="Playlist" 
          count="592 songs" 
          isLiked={true} 
        />
        
        <SidebarPlaylist 
          name="Music Blogs" 
          icon={<Book className="text-orange-700" size={18} />} 
          type="Blog" 
        />
        
        <SidebarPlaylist 
          name="Jack Pearson" 
          image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png" 
          type="Artist" 
        />
        
        <SidebarPlaylist 
          name="Atlanta Pop Festival 1970" 
          type="Playlist" 
          owner="seddy1977" 
        />
        
        <SidebarPlaylist 
          name="Frankie Miller" 
          type="Artist" 
        />
        
        <SidebarPlaylist 
          name="Juicy Lucy" 
          type="Artist" 
        />
        
        <SidebarPlaylist 
          name="Snakecharmer: Anthology" 
          type="Album" 
          owner="Snakecharmer" 
        />
        
        <SidebarPlaylist 
          name="DJ" 
          type="Click to start listening" 
        />
        
        <SidebarPlaylist 
          name="Jakko M. Jakszyk" 
          type="Artist" 
        />
        
        <SidebarPlaylist 
          name="Mel Collins" 
          type="Artist" 
        />
      </div>
    </div>
  );
};

export default Sidebar;
