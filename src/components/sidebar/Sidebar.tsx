
import { useState, useEffect } from "react";
import { Search, Library, Heart, Book } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedSongsCount, setLikedSongsCount] = useState(0);
  const { user } = useAuth();
  
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
  
  // Fetch liked songs count for authenticated users
  useEffect(() => {
    const fetchLikedSongsCount = async () => {
      if (!user) {
        setLikedSongsCount(0);
        return;
      }
      
      try {
        // Try to get user preferences with liked songs count
        const { data, error } = await supabase
          .from('user_preferences')
          .select('liked_songs_count')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching liked songs count:', error);
          return;
        }
        
        // If we have data, update the count
        if (data && data.liked_songs_count !== null) {
          setLikedSongsCount(data.liked_songs_count);
        } else {
          // Alternatively, count the tracks that are liked
          const { data: likedTracks, error: tracksError } = await supabase
            .from('tracks')
            .select('id')
            .eq('is_liked', true);
            
          if (tracksError) {
            console.error('Error counting liked tracks:', tracksError);
            return;
          }
          
          setLikedSongsCount(likedTracks?.length || 0);
          
          // Update the preference with the correct count
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              liked_songs_count: likedTracks?.length || 0,
              updated_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error in liked songs count effect:', error);
      }
    };
    
    fetchLikedSongsCount();
    
    // Set up a subscription to listen for changes to the tracks table
    if (user) {
      const channel = supabase
        .channel('track-likes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'tracks',
          filter: 'is_liked=true'
        }, () => {
          fetchLikedSongsCount();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
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
          count={`${likedSongsCount} song${likedSongsCount !== 1 ? 's' : ''}`} 
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
