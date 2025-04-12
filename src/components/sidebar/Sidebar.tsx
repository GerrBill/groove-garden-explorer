
import { Search, PlusSquare, ExternalLink, Library, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-black flex flex-col border-r border-zinc-800 flex-shrink-0">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-1">
          <div className="w-8 h-8">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white">
              <path
                fill="currentColor"
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.059 14.406c-.192.233-.53.29-.799.151-2.138-1.285-4.813-1.572-7.965-.862a.595.595 0 0 1-.329-.027.605.605 0 0 1-.274-.177.619.619 0 0 1 .021-.845.583.583 0 0 1 .423-.178c3.466-.83 6.444-.493 8.774.929.271.138.332.475.149.708zm1.094-2.34c-.24.291-.67.372-.96.198-2.446-1.471-6.169-1.898-9.072-1.04a.776.776 0 0 1-.568-.113.786.786 0 0 1-.286-.512.774.774 0 0 1 .113-.567.785.785 0 0 1 .511-.286c3.308-.979 7.424-.5 10.265 1.233.291.172.392.6.198.96zm.094-2.442c-2.939-1.719-7.78-1.88-10.58-1.04a.93.93 0 0 1-1.164-.77.93.93 0 0 1 .772-1.163c3.22-.962 8.573-.775 11.963 1.2a.931.931 0 0 1 .273 1.295.933.933 0 0 1-1.264.277z"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-2xl">Groove</span>
        </div>
        
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
        
        <div className="space-x-2 flex">
          <button className="px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800">
            Playlists
          </button>
          <button className="px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800">
            Artists
          </button>
          <button className="px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800">
            Albums
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
          icon={<Heart className="text-spotify-accent" size={18} />} 
          type="Playlist" 
          count="592 songs" 
          isLiked={true} 
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
