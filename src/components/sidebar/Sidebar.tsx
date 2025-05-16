
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AlbumItem from "./AlbumItem";
import BlogItem from "./BlogItem";
import { toast } from "@/hooks/use-toast";

const Sidebar = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<'albums' | 'blogs' | 'playlists'>('albums');
  const queryClient = useQueryClient();

  console.log("Sidebar component rendering with location:", location.pathname);

  // Set active section based on location
  useEffect(() => {
    if (location.pathname === '/' || location.pathname.startsWith('/album/')) {
      setActiveSection('albums');
    } else if (location.pathname === '/blog' || location.pathname.startsWith('/blog/')) {
      setActiveSection('blogs');
    } else if (location.pathname === '/playlists' || location.pathname.startsWith('/playlist/')) {
      setActiveSection('playlists');
    }
    console.log("Setting active section to:", activeSection);
  }, [location.pathname]);

  // Get playlists for the sidebar - enable always to ensure data is loaded
  const {
    data: playlists,
    error: playlistsError,
    isLoading: playlistsLoading
  } = useQuery({
    queryKey: ['sidebar-playlists'],
    queryFn: async () => {
      console.log("Fetching sidebar playlists data...");
      const {
        data,
        error
      } = await supabase.from('playlists').select('*').order('created_at', {
        ascending: false
      });
      
      if (error) {
        console.error("Error fetching playlists:", error);
        throw error;
      }
      
      console.log("Playlists data received:", data);
      return data || [];
    }
  });

  // Get albums for the sidebar - enable always to ensure data is loaded
  const {
    data: albums,
    error: albumsError,
    isLoading: albumsLoading
  } = useQuery({
    queryKey: ['sidebar-albums'],
    queryFn: async () => {
      console.log("Fetching sidebar albums data...");
      const {
        data,
        error
      } = await supabase.from('albums').select('*').order('created_at', {
        ascending: false
      }).limit(10);
      
      if (error) {
        console.error("Error fetching albums:", error);
        throw error;
      }
      
      console.log("Albums data received:", data);
      return data || [];
    }
  });

  // Get blog articles for the sidebar - enable always to ensure data is loaded
  const {
    data: blogArticles,
    error: blogError,
    isLoading: blogLoading,
    refetch: refetchBlogArticles
  } = useQuery({
    queryKey: ['sidebar-blogs'],
    queryFn: async () => {
      console.log("Fetching sidebar blogs data...");
      const {
        data,
        error
      } = await supabase.from('blog_articles').select('*').order('published_at', {
        ascending: false
      }).limit(10);
      
      if (error) {
        console.error("Error fetching blogs:", error);
        throw error;
      }
      
      console.log("Blog articles data received:", data);
      return data || [];
    }
  });
  
  // Show error toasts for failed queries
  useEffect(() => {
    if (playlistsError) {
      toast({
        title: "Error loading playlists",
        description: "Please try again later",
        variant: "destructive"
      });
    }
    
    if (albumsError) {
      toast({
        title: "Error loading albums",
        description: "Please try again later",
        variant: "destructive"
      });
    }
    
    if (blogError) {
      toast({
        title: "Error loading blog articles",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  }, [playlistsError, albumsError, blogError]);
  
  // Handle blog article deletion
  const handleBlogItemDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
    refetchBlogArticles();
  };

  const routes = useMemo(() => [{
    label: 'Albums',
    active: activeSection === 'albums',
    href: '/'
  }, {
    label: 'Blogs',
    active: activeSection === 'blogs',
    href: '/blog'
  }, {
    label: 'Playlists',
    active: activeSection === 'playlists',
    href: '/playlists'
  }], [activeSection]);
  
  return (
    <div className="flex h-full">
      <div className="hidden md:flex flex-col gap-y-2 bg-black h-full w-[300px] p-2 px-0">
        <div className="flex gap-2 px-5 py-[3px]">
          {routes.map(item => <SidebarItem key={item.label} {...item} />)}
        </div>
        <div className="overflow-y-auto h-full px-5 pt-4">
          {activeSection === 'playlists' && (
            <>
              <div className="text-xs font-semibold text-spotify-text-secondary uppercase tracking-wider mb-2">
                Your Playlists
              </div>
              <div className="space-y-1">
                {playlistsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-zinc-800 rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  <SidebarPlaylist playlists={playlists || []} />
                )}
              </div>
            </>
          )}
          
          {activeSection === 'albums' && (
            <>
              <div className="text-xs font-semibold text-spotify-text-secondary uppercase tracking-wider mb-2">
                Recent Albums
              </div>
              <div className="space-y-1">
                {albumsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-zinc-800 rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  albums && albums.length > 0 ? (
                    albums.map(album => <AlbumItem key={album.id} album={album} />)
                  ) : (
                    <div className="text-xs text-zinc-500 italic px-2 py-1">
                      No albums found
                    </div>
                  )
                )}
              </div>
            </>
          )}
          
          {activeSection === 'blogs' && (
            <>
              <div className="text-xs font-semibold text-spotify-text-secondary uppercase tracking-wider mb-2">
                Recent Articles
              </div>
              <div className="space-y-1">
                {blogLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-zinc-800 rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  blogArticles && blogArticles.length > 0 ? (
                    blogArticles.map(article => <BlogItem 
                      key={article.id} 
                      article={article} 
                      onDeleted={handleBlogItemDeleted}
                    />)
                  ) : (
                    <div className="text-xs text-zinc-500 italic px-2 py-1">
                      No articles found
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
