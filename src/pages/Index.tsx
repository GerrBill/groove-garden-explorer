
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import TopNav from '@/components/navigation/TopNav';
import HomeSection from '@/components/home/HomeSection';
import AlbumCard from '@/components/home/AlbumCard';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobileView = useIsMobile(700); // Custom breakpoint at 700px

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
      
      // Update the artist name for Frankie Sings the Blues album to Bill Parker
      const updatedData = data?.map(album => {
        if (album.title === "Frankie Sings the Blues") {
          return { ...album, artist: "Bill Parker" };
          
          // Update in database
          updateAlbumArtist(album.id, "Bill Parker");
        }
        return album;
      });
      
      setAlbums(updatedData || []);
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
  
  // Function to update album artist in the database
  const updateAlbumArtist = async (albumId: string, newArtist: string) => {
    try {
      const { error } = await supabase
        .from('albums')
        .update({ artist: newArtist })
        .eq('id', albumId);
        
      if (error) throw error;
      
      // Also update the artist in tracks table for this album
      const { error: tracksError } = await supabase
        .from('tracks')
        .update({ artist: newArtist })
        .eq('album_id', albumId);
        
      if (tracksError) throw tracksError;
      
      console.log(`Updated artist for album ${albumId} to ${newArtist}`);
    } catch (error) {
      console.error('Error updating album artist:', error);
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

  // Determine the grid columns based on screen size
  const gridClass = isMobileView 
    ? "grid-cols-1" // 1 column on mobile
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"; // Default grid for larger screens

  return (
    <div className="flex-1 overflow-hidden w-full pb-24">
      <TopNav 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab}
        onAlbumAdded={handleAlbumAdded}
      />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="px-4 py-4 max-w-full mx-auto">
          <HomeSection 
            title="Available Albums"
          >
            {loading ? (
              <div className={`grid ${gridClass} gap-1`}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-full p-1 rounded-md">
                    <div className="aspect-square bg-zinc-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid ${gridClass} gap-1`}>
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
