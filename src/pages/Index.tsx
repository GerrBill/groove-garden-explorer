
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import TopNav from '@/components/navigation/TopNav';
import HomeSection from '@/components/home/HomeSection';
import AlbumCard from '@/components/home/AlbumCard';
import FeaturedCard from '@/components/home/FeaturedCard';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const featuredAlbum = albums.length > 0 ? albums[0] : null;

  const handleAlbumAdded = () => {
    console.log("Album added, refreshing list...");
    fetchAlbums();
    toast({
      title: "Success",
      description: "Album added successfully!",
      variant: "default"
    });
  };

  return (
    <div className="flex-1 overflow-hidden w-full pb-24">
      <TopNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="px-4 py-4 max-w-full mx-auto">
          <HomeSection title="Featured Album">
            {featuredAlbum && (
              <FeaturedCard 
                image={featuredAlbum.image_url}
                title={featuredAlbum.title || "Dark Academia Jazz"}
                description={featuredAlbum.artist ? `By ${featuredAlbum.artist}` : "In a dim, dusty library, reading your novel..."}
                type="Album"
                id={featuredAlbum.id}
              />
            )}
            {!featuredAlbum && (
              <FeaturedCard 
                image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
                title="Dark Academia Jazz"
                description="In a dim, dusty library, reading your novel, and thinking of that special someone..."
                type="Playlist"
              />
            )}
          </HomeSection>
          
          <HomeSection 
            title="Available Albums" 
            showAllLink
          >
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-full p-1 rounded-md">
                    <div className="aspect-square bg-zinc-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {albums.length > 0 ? (
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
                )}
              </div>
            )}
          </HomeSection>
          
          <HomeSection title="Recently played" showAllLink>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {albums.slice(0, 6).map((album) => (
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
          </HomeSection>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
