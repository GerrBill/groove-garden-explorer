
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import TrackList from '@/components/shared/TrackList';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import AlbumHeader from '@/components/album/AlbumHeader';

const Album = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: album, isLoading, error } = useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      // Fetch album details
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();

      if (albumError) throw albumError;

      // Fetch tracks for this album
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true });

      if (tracksError) throw tracksError;

      // If user is logged in, get like status through a custom approach
      let tracksWithLikeStatus = [...tracksData];
      
      if (user) {
        // We'll use a simpler method to mark liked tracks - in production you would use a join
        for (let i = 0; i < tracksWithLikeStatus.length; i++) {
          tracksWithLikeStatus[i].is_liked = false; // Default value
        }
        
        // Normally we would use a join query, but we'll simulate it for now
        console.log("User logged in, would fetch liked tracks here");
      }

      return {
        ...albumData,
        tracks: tracksWithLikeStatus
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Skeleton className="w-full aspect-square rounded-lg" />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <div className="mt-8">
              <Skeleton className="h-8 w-full" />
              <div className="space-y-2 mt-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    toast({
      title: "Error",
      description: "Failed to load album details. Please try again later.",
      variant: "destructive",
    });
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold">Failed to load album</h2>
        <p className="text-zinc-400 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden w-full pb-24">
      {album && (
        <div className="container mx-auto px-4 md:px-0 md:max-w-none">
          <AlbumHeader 
            image={album.image_url}
            title={album.title}
            artist={album.artist}
            year={album.year || ''}
            trackCount={album.track_count || ''}
            duration={album.duration || ''}
          />
          
          <div className="md:pl-0 pl-4 mt-6">
            {album.tracks && album.tracks.length > 0 ? (
              <TrackList tracks={album.tracks} albumId={album.id} />
            ) : (
              <p className="text-zinc-500">No tracks available for this album.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Album;
