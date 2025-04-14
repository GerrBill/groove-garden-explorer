
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Home, Library, Search, ListMusic, Newspaper, Settings } from "lucide-react";
import SidebarItem from "./SidebarItem";
import SidebarPlaylist from "./SidebarPlaylist";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Sidebar = () => {
  const location = useLocation();
  
  // Get all playlists for the sidebar
  const { data: playlists } = useQuery({
    queryKey: ['sidebar-playlists'],
    queryFn: async () => {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const routes = useMemo(() => [
    {
      icon: Home,
      label: 'Home',
      active: location.pathname === '/',
      href: '/'
    },
    {
      icon: Search,
      label: 'Search',
      active: location.pathname === '/search',
      href: '/search'
    },
    {
      icon: Library,
      label: 'Library',
      active: location.pathname === '/library',
      href: '/library'
    },
    {
      icon: ListMusic,
      label: 'Playlists',
      active: location.pathname === '/playlists',
      href: '/playlists'
    },
    {
      icon: Newspaper,
      label: 'Blog',
      active: location.pathname === '/blog' || location.pathname.startsWith('/blog/'),
      href: '/blog'
    },
    {
      icon: Settings,
      label: 'Settings',
      active: location.pathname === '/settings',
      href: '/settings'
    }
  ], [location.pathname]);

  return (
    <div className="flex h-full">
      <div 
        className="hidden md:flex flex-col gap-y-2 bg-sidebar h-full w-[300px] p-2"
      >
        <div className="flex flex-col gap-y-4 px-5 py-4">
          {routes.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
            />
          ))}
        </div>
        <div className="overflow-y-auto h-full">
          <SidebarPlaylist playlists={playlists || []} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
