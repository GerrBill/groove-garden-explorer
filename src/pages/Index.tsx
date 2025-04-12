
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import TopNav from '@/components/navigation/TopNav';
import HomeSection from '@/components/home/HomeSection';
import AlbumCard from '@/components/home/AlbumCard';
import CategoryCard from '@/components/home/CategoryCard';
import FeaturedCard from '@/components/home/FeaturedCard';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
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
    }

    fetchAlbums();
  }, [toast]);

  const featuredAlbum = albums.length > 0 ? albums[0] : null;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <TopNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CategoryCard 
            image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
            title="Focus Radio"
            size="lg"
          />
          <div className="grid grid-cols-2 gap-6">
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Jack Pearson"
              size="md"
            />
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Tore Down House"
              size="md"
            />
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Live At North Sea Jazz Festival"
              size="md"
            />
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Crimes Of Passion"
              size="md"
            />
          </div>
        </div>
        
        <HomeSection title="Picked for you">
          {featuredAlbum && (
            <FeaturedCard 
              image={featuredAlbum.image_url}
              title={featuredAlbum.title || "Dark Academia Jazz"}
              description={featuredAlbum.artist || "By " + featuredAlbum.artist}
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
        
        <HomeSection title="Available Albums" showAllLink>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full sm:w-44 p-4 rounded-md">
                  <div className="aspect-square bg-zinc-800 rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {albums.map((album) => (
                <AlbumCard 
                  key={album.id}
                  id={album.id}
                  image={album.image_url}
                  title={album.title}
                  artist={album.artist}
                />
              ))}
            </div>
          )}
        </HomeSection>
        
        <HomeSection title="Recently played" showAllLink>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-5">
            {albums.slice(0, 7).map((album) => (
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
    </div>
  );
};

export default Index;
