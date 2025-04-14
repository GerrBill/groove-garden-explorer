
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { Library, Music, ListMusic, BookOpen } from "lucide-react";

// Define types for our content
interface BlogPost {
  id: string;
  title: string;
  author: string;
  image_url?: string;
}

interface Playlist {
  id: string;
  name: string;
  owner?: string;
  image_url?: string;
}

const Sidebar = () => {
  const [activeFilter, setActiveFilter] = useState('Albums');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };
  
  // Fetch data based on active filter
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        if (activeFilter === 'Albums') {
          const { data, error } = await supabase
            .from('albums')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          setAlbums(data || []);
        } 
        else if (activeFilter === 'Playlists') {
          const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          
          // Transform data to match our component's expected format
          const transformedPlaylists = data.map(playlist => ({
            id: playlist.id,
            name: playlist.title,
            owner: playlist.owner,
            image_url: playlist.image_url
          }));
          
          setPlaylists(transformedPlaylists);
        } 
        else if (activeFilter === 'Blogs') {
          const { data, error } = await supabase
            .from('blog_articles')
            .select('id, title, author, image_url')
            .order('published_at', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          setBlogPosts(data || []);
        }
      } catch (error) {
        console.error(`Error fetching ${activeFilter}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);
  
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
        
        {/* Add links to main section pages */}
        <div className="flex flex-col gap-1 mt-2">
          <Link 
            to="/playlists" 
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-800"
          >
            <ListMusic size={16} className="text-orange-700" />
            <span>View All Playlists</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-800"
          >
            <Music size={16} className="text-orange-700" />
            <span>View All Albums</span>
          </Link>
          <Link 
            to="/blog" 
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-800"
          >
            <BookOpen size={16} className="text-orange-700" />
            <span>View All Blog Posts</span>
          </Link>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow px-2">
        {loading ? (
          <div className="py-2 px-4 text-xs text-zinc-400">Loading {activeFilter.toLowerCase()}...</div>
        ) : (
          <>
            {activeFilter === 'Albums' && (
              <>
                {albums.length > 0 ? (
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
                ) : (
                  <div className="py-2 px-4 text-xs text-zinc-400">No albums found</div>
                )}
              </>
            )}
            
            {activeFilter === 'Playlists' && (
              <>
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <SidebarPlaylist 
                      key={playlist.id}
                      name={playlist.name} 
                      image={playlist.image_url}
                      type="Playlist" 
                      owner={playlist.owner} 
                      link={`/playlist/${playlist.id}`}
                    />
                  ))
                ) : (
                  <div className="py-2 px-4 text-xs text-zinc-400">No playlists found</div>
                )}
              </>
            )}
            
            {activeFilter === 'Blogs' && (
              <>
                {blogPosts.length > 0 ? (
                  blogPosts.map((post) => (
                    <SidebarPlaylist 
                      key={post.id}
                      name={post.title} 
                      image={post.image_url}
                      type="Blog post" 
                      owner={post.author} 
                      link={`/blog/${post.id}`}
                    />
                  ))
                ) : (
                  <div className="py-2 px-4 text-xs text-zinc-400">No blog posts found</div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
