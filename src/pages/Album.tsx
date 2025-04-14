
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AlbumHeader from "@/components/album/AlbumHeader";
import AlbumActions from "@/components/album/AlbumActions";
import TrackList from "@/components/album/TrackList";
import RelatedAlbums from "@/components/album/RelatedAlbums";
import { Track, Album as AlbumType } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import AlbumNotFound from "@/components/album/AlbumNotFound";
import AlbumNavigation from "@/components/album/AlbumNavigation";
import UpdateAlbumArtDialog from "@/components/album/UpdateAlbumArtDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrackWithMeta extends Track {
  isLiked?: boolean;
  isPlaying?: boolean;
  trackId: string;
}

const Album = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [tracks, setTracks] = useState<TrackWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();

  const fetchAlbum = async () => {
    if (!id) return;
    
    try {
      // Fetch album details
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();
      
      if (albumError) throw albumError;
      setAlbum(albumData);
      
      // Fetch album tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true });
      
      if (tracksError) throw tracksError;
      
      // Transform tracks to include additional metadata
      const transformedTracks = tracksData.map(track => ({
        ...track,
        isLiked: track.is_liked || false,
        isPlaying: false,
        trackId: track.id
      }));
      
      setTracks(transformedTracks);
    } catch (error) {
      console.error('Error fetching album and tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load album data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  // Handle a track being added to album
  const handleTrackAdded = (track: Track) => {
    // Add the new track to the tracks list
    setTracks(prevTracks => [
      ...prevTracks, 
      { 
        ...track, 
        isLiked: false, 
        isPlaying: false, 
        trackId: track.id 
      }
    ]);
    
    // Also update the album track count if available
    if (album) {
      const newTrackCount = parseInt(album.track_count || '0', 10) + 1;
      setAlbum({
        ...album,
        track_count: newTrackCount.toString()
      });
    }
    
    toast({
      title: "Track Added",
      description: `"${track.title}" has been added to the album.`,
    });
  };

  // Handle toggling like for a track
  const handleToggleLike = (trackId: string) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId 
          ? { ...track, isLiked: !track.isLiked } 
          : track
      )
    );
  };

  // Handle album art being updated
  const handleAlbumArtUpdated = (imageUrl: string) => {
    if (album) {
      setAlbum({
        ...album,
        image_url: imageUrl
      });
      
      toast({
        title: "Album Art Updated",
        description: "The album artwork has been updated successfully.",
      });
    }
  };

  // If album not found and not loading
  if (!album && !loading) {
    return <AlbumNotFound />;
  }

  return (
    <div className="flex-1 w-full pb-24">
      <AlbumNavigation />
      
      {album && (
        <>
          <AlbumHeader 
            title={album.title}
            artist={album.artist}
            image={album.image_url}
            year={album.year}
            trackCount={album.track_count}
            duration={album.duration}
          />
          
          <AlbumActions 
            albumId={id}
            onTrackAdded={handleTrackAdded}
            updateAlbumArtDialog={
              <UpdateAlbumArtDialog 
                albumId={id}
                currentImage={album.image_url}
                onImageUpdated={handleAlbumArtUpdated}
              />
            }
          />
          
          <ScrollArea className="h-[calc(100vh-400px)]">
            <TrackList 
              tracks={tracks} 
              onToggleLike={handleToggleLike}
              albumName={album.title}
            />
          </ScrollArea>
          
          {isMobile !== undefined && (
            <RelatedAlbums 
              album={album}
              isMobile={isMobile}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Album;
