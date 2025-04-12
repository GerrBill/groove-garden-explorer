import { Search, PlusSquare, ExternalLink, Library, Heart, Book } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-black flex flex-col border-r border-zinc-800 flex-shrink-0 transition-all duration-300 md:translate-x-0 sm:w-56 xs:w-48 absolute md:relative z-20 transform -translate-x-full md:translate-x-0">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SidebarItem icon={<Library />} text="Your Library" />
          <div className="flex justify-between mt-2">
            <button className="p-2 rounded-full hover:bg-zinc-800">
              <PlusSquare size={20} className="text-spotify-text-secondary" />
            </button>
            <button className="p-2 rounded-full hover:bg-zinc-800">
              <ExternalLink size={20} className="text-spotify-text-secondary" />
            </button>
          </div>
        </div>
        
        <div className="space-x-1 flex flex-wrap gap-1">
          <button className="px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full hover:bg-zinc-800">
            Playlists
          </button>
          <button className="px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full hover:bg-zinc-800">
            Artists
          </button>
          <button className="px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full hover:bg-zinc-800">
            Albums
          </button>
          <button className="px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full hover:bg-zinc-800">
            Blogs
          </button>
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
