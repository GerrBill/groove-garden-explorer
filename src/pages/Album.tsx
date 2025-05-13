import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType, Track } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import TrackList from '@/components/album/TrackList';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

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

      // If user is logged in, check which tracks are liked
      let likedTrackIds: string[] = [];
      if (user) {
        const { data: likedData, error: likedError } = await supabase
          .from('liked_tracks')
          .select('track_id')
          .eq('user_id', user.id);

        if (!likedError && likedData) {
          likedTrackIds = likedData.map(item => item.track_id);
        }
      }

      // Add is_liked property to each track
      const tracksWithLikeStatus = tracksData.map((track: Track) => ({
        ...track,
        is_liked: likedTrackIds.includes(track.id)
      }));

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
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <AspectRatio ratio={1 / 1} className="bg-zinc-900 rounded-lg overflow-hidden">
            {album.image_url ? (
              <img
                src={album.image_url}
                alt={album.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <span className="text-zinc-500">No Image</span>
              </div>
            )}
          </AspectRatio>
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <p className="text-xl text-zinc-400 mt-2">{album.artist}</p>
          <div className="flex gap-2 text-sm text-zinc-500 mt-1">
            <span>{album.year}</span>
            {album.track_count && <span>• {album.track_count} songs</span>}
            {album.duration && <span>• {album.duration}</span>}
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Tracks</h2>
            {album.tracks && album.tracks.length > 0 ? (
              <TrackList tracks={album.tracks} albumId={album.id} />
            ) : (
              <p className="text-zinc-500">No tracks available for this album.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Album;
