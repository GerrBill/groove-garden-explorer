
import { useState, useEffect } from "react";
import { Library, Book, Music } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };
  
  // Fetch albums for the sidebar
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
                  ? 'bg-orange-800 text-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleFilterClick('Playlists')}
            >
              Playlists
            </button>
            <button 
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex-1 ${
                activeFilter === 'Albums' 
                  ? 'bg-orange-800 text-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleFilterClick('Albums')}
            >
              Albums
            </button>
            <button 
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex-1 ${
                activeFilter === 'Blogs' 
                  ? 'bg-orange-800 text-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              onClick={() => handleFilterClick('Blogs')}
            >
              Blogs
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow px-2">
        <Link to="/">
          <SidebarPlaylist 
            name="Albums" 
            icon={<Music className="text-orange-700" size={18} />} 
            type="List" 
          />
        </Link>
        
        <Link to="/blog">
          <SidebarPlaylist 
            name="Blogs" 
            icon={<Book className="text-orange-700" size={18} />} 
            type="Blog" 
          />
        </Link>
        
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
