
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AlbumCard from "@/components/home/AlbumCard";
import BlogCard from "@/components/blog/BlogCard";

const Sidebar = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<'albums' | 'blogs' | 'playlists'>('albums');
  
  // Set active section based on location
  useEffect(() => {
    if (location.pathname === '/' || location.pathname.startsWith('/album/')) {
      setActiveSection('albums');
    } else if (location.pathname === '/blog' || location.pathname.startsWith('/blog/')) {
      setActiveSection('blogs');
    } else if (location.pathname === '/playlists' || location.pathname.startsWith('/playlist/')) {
      setActiveSection('playlists');
    }
  }, [location.pathname]);
  
  // Get playlists for the sidebar
  const { data: playlists } = useQuery({
    queryKey: ['sidebar-playlists'],
    queryFn: async () => {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: activeSection === 'playlists'
  });
  
  // Get albums for the sidebar
  const { data: albums } = useQuery({
    queryKey: ['sidebar-albums'],
    queryFn: async () => {
      const { data } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: activeSection === 'albums'
  });
  
  // Get blog articles for the sidebar
  const { data: blogArticles } = useQuery({
    queryKey: ['sidebar-blogs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: activeSection === 'blogs'
  });

  const routes = useMemo(() => [
    {
      label: 'Albums',
      active: activeSection === 'albums',
      href: '/'
    },
    {
      label: 'Blogs',
      active: activeSection === 'blogs',
      href: '/blog'
    },
    {
      label: 'Playlists',
      active: activeSection === 'playlists',
      href: '/playlists'
    }
  ], [activeSection]);

  return (
    <div className="flex h-full">
      <div 
        className="hidden md:flex flex-col gap-y-2 bg-sidebar h-full w-[300px] p-2"
      >
        <div className="flex gap-2 px-5 py-4">
          {routes.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
            />
          ))}
        </div>
        <div className="overflow-y-auto h-full px-5 pt-4">
          {activeSection === 'playlists' && (
            <>
              <div className="text-xs font-semibold text-spotify-text-secondary uppercase tracking-wider mb-2">
                Your Playlists
              </div>
              <div className="space-y-1">
                {playlists?.map((playlist) => (
                  <div key={playlist.id} className="block mb-2">
                    <SidebarPlaylist playlists={playlists || []} />
                  </div>
                ))}
              </div>
            </>
          )}
          
          {activeSection === 'albums' && (
            <>
              <div className="text-xs font-semibold text-spotify-text-secondary uppercase tracking-wider mb-2">
                Recent Albums
              </div>
              <div className="grid grid-cols-2 gap-2">
                {albums?.map((album) => (
                  <AlbumCard 
                    key={album.id}
                    id={album.id}
                    image={album.image_url}
                    title={album.title}
                    artist={album.artist}
                    size="sm"
                  />
                ))}
              </div>
            </>
          )}
          
          {activeSection === 'blogs' && (
            <>
              <div className="text-xs font-semibold text-spotify-text-secondary uppercase tracking-wider mb-2">
                Recent Articles
              </div>
              <div className="space-y-3">
                {blogArticles?.map((article) => (
                  <BlogCard 
                    key={article.id}
                    id={article.id}
                    image={article.image_url || ''}
                    title={article.title}
                    excerpt={article.excerpt}
                    author={article.author}
                    date={article.published_at}
                    category={article.category || 'Music'}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
