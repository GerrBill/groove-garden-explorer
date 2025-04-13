
import { useState, useEffect } from "react";
import { Search, Library, Heart, Book } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';

const Sidebar = () => {
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };
  
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setAlbums(data || []);
      } catch (error) {
        console.error('Error fetching albums for sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);
  
  return (
    <div className="w-64 h-screen bg-black flex flex-col border-r border-zinc-800 flex-shrink-0 transition-all duration-300 md:translate-x-0 sm:w-56 xs:w-48 absolute md:relative z-20 transform">
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
        
        {/* Display actual albums from the database instead of placeholders */}
        {loading ? (
          <div className="py-2 px-4 text-xs text-zinc-400">Loading albums...</div>
        ) : (
          albums.map((album) => (
            <SidebarPlaylist 
              key={album.id}
              name={album.title} 
              image={album.image_url}
              type="Album" 
              owner={album.artist} 
              link={`/album/${album.id}`}
            />
          ))
        )}
        
        {albums.length === 0 && !loading && (
          <div className="py-2 px-4 text-xs text-zinc-400">No albums found</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
