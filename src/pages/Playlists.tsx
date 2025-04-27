import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/navigation/TopNav';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, ListMusic } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AlbumCard from '@/components/home/AlbumCard';
import AddPlaylistDialog from '@/components/playlist/AddPlaylistDialog';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
interface Playlist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  owner: string;
  created_at: string;
}
const ADMIN_EMAILS = ["wjparker@outlook.com", "ghodgett59@gmail.com"];
const Playlists = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const isMobileView = useIsMobile(700);
  const {
    user
  } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  const {
    colorTheme
  } = useTheme();
  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      console.log("Fetching playlists...");
      const {
        data,
        error
      } = await supabase.from('playlists').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      console.log("Playlists fetched:", data);
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPlaylists();
  }, []);
  const handlePlaylistAdded = () => {
    console.log("Playlist added, refreshing list...");
    fetchPlaylists();
    toast({
      title: "Success",
      description: "Playlist added successfully!",
      variant: "default"
    });
  };
  const gridClass = isMobileView ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  return <div className="flex-1 overflow-hidden w-full pb-24 bg-black">
      <TopNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full bg-black">
        <div className="px-4 py-4 max-w-full mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">Your Playlists</h2>
              
              <div className="flex items-center ml-8 gap-6">
                <Link to="/blog" className="flex items-center gap-2 text-theme-color hover:text-white transition-colors">
                  <BookOpen size={18} />
                  
                </Link>
                <Link to="/playlists" className="flex items-center gap-2 text-theme-color hover:text-white transition-colors">
                  <ListMusic size={18} />
                  <span>Playlists</span>
                </Link>
              </div>
            </div>
            
            {user && <div className="ml-6">
                <AddPlaylistDialog onPlaylistAdded={handlePlaylistAdded}>
                  <Button size="sm" className="flex items-center gap-1 rounded-full">
                    <Plus size={16} />
                    Add Playlist
                  </Button>
                </AddPlaylistDialog>
              </div>}
          </div>
          
          
          <div className={`grid ${gridClass} gap-4 py-4`}>
            {loading ? [...Array(10)].map((_, i) => <div key={i} className="w-full p-1 rounded-md">
                  <div className="aspect-square bg-zinc-800 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                </div>) : playlists.length > 0 ? playlists.map(playlist => <AlbumCard key={playlist.id} id={playlist.id} image={playlist.image_url || '/placeholder.svg'} title={playlist.title} artist={playlist.owner} size="md" type="playlist" />) : <div className="col-span-full text-center py-8 text-zinc-400">
                  No playlists found. Click "Add Playlist" to create one.
                </div>}
          </div>
        </div>
      </ScrollArea>
    </div>;
};
export default Playlists;