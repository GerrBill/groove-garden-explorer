import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import TopNav from '@/components/navigation/TopNav';
import HomeSection from '@/components/home/HomeSection';
import AlbumCard from '@/components/home/AlbumCard';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import AddAlbumDialog from '@/components/album/AddAlbumDialog';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobileView = useIsMobile(700); // Custom breakpoint at 700px
  const { user } = useAuth();

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      console.log("Fetching albums...");
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Albums fetched:", data);
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast({
        title: "Error",
        description: "Failed to load albums. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleAlbumAdded = () => {
    console.log("Album added, refreshing list...");
    fetchAlbums();
    toast({
      title: "Success",
      description: "Album added successfully!",
      variant: "default"
    });
  };

  const gridClass = isMobileView 
    ? "grid-cols-1" // 1 column on mobile
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"; // Default grid for larger screens

  return (
    <div className="flex-1 overflow-hidden w-full pb-24">
      <TopNav 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab}
      />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="px-4 py-4 max-w-full mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Available Albums</h2>
            {user && (
              <div className="ml-6">
                <AddAlbumDialog onAlbumAdded={handleAlbumAdded}>
                  <Button size="sm" className="flex items-center gap-1 rounded-full">
                    <Plus size={16} />
                    Add Album
                  </Button>
                </AddAlbumDialog>
              </div>
            )}
          </div>
          <div className="h-[60px]"></div> {/* 60px gap as requested */}
          
          <div className={`grid ${gridClass} gap-1`}>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="w-full p-1 rounded-md">
                  <div className="aspect-square bg-zinc-800 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                </div>
              ))
            ) : (
              albums.length > 0 ? (
                albums.map((album) => (
                  <AlbumCard 
                    key={album.id}
                    id={album.id}
                    image={album.image_url}
                    title={album.title}
                    artist={album.artist}
                    size="md"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-zinc-400">
                  No albums found. Click "Add Album" to create one.
                </div>
              )
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
