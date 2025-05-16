
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import TopNav from '@/components/navigation/TopNav';
import AlbumCard from '@/components/home/AlbumCard';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import AddAlbumDialog from '@/components/album/AddAlbumDialog';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const ADMIN_EMAILS = ["wjparker@outlook.com", "ghodgett59@gmail.com"];

const Index = () => {
  const { toast } = useToast();
  const isMobileView = useIsMobile(700); 
  const auth = useAuth();
  const user = auth?.user;
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  console.log("Index page rendered, user:", user);

  const {
    data: albums,
    isLoading,
    error,
    refetch: fetchAlbums
  } = useQuery({
    queryKey: ['albums-page'],
    queryFn: async () => {
      console.log("Fetching albums for Index page...");
      const {
        data,
        error
      } = await supabase.from('albums').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching albums:', error);
        throw error;
      }
      console.log("Albums fetched:", data);
      return data || [];
    }
  });

  // Show error toast if fetch fails
  if (error) {
    console.error('Error fetching albums:', error);
    toast({
      title: "Error",
      description: "Failed to load albums. Please try again later.",
      variant: "destructive"
    });
  }

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
    ? "grid-cols-1" 
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"; 

  console.log("Rendering Index page with data:", albums);

  return (
    <div className="flex-1 overflow-hidden w-full pb-24 bg-black">
      <TopNav />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full bg-black">
        <div className="px-4 py-4 max-w-full mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Available Albums</h2>
            {isAdmin && (
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
          
          <div className={`grid ${gridClass} gap-4 py-4`}>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="w-full p-1 rounded-md">
                  <div className="aspect-square bg-zinc-800 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                </div>
              ))
            ) : (
              albums && albums.length > 0 ? (
                albums.map(album => (
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
