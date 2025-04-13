
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAlbumData } from '@/hooks/use-album-data';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/album/TrackList';
import AlbumNavigation from '@/components/album/AlbumNavigation';
import AlbumActions from '@/components/album/AlbumActions';
import RelatedAlbums from '@/components/album/RelatedAlbums';
import AlbumNotFound from '@/components/album/AlbumNotFound';
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Track } from '@/types/supabase';

const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { album, tracks, loading, setTracks } = useAlbumData(id);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTrackAdded = (newTrack: Track) => {
    // Add the new track to the tracks list
    setTracks(prevTracks => [...prevTracks, newTrack]);
    
    toast({
      title: "Success",
      description: "Track added successfully!",
      duration: 3000
    });
  };

  const handleToggleLike = async (trackId: string) => {
    const trackIndex = tracks.findIndex(track => track.id === trackId);
    if (trackIndex === -1) return;

    const updatedTracks = [...tracks];
    const newLikedStatus = !updatedTracks[trackIndex].is_liked;
    updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], is_liked: newLikedStatus };
    
    setTracks(updatedTracks);
    
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ is_liked: newLikedStatus })
        .eq('id', trackId);
        
      if (error) throw error;
      
      toast({
        title: newLikedStatus ? "Added to Liked Songs" : "Removed from Liked Songs",
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating track:', error);
      // Revert the optimistic update
      updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], is_liked: !newLikedStatus };
      setTracks(updatedTracks);
    }
  };

  // Convert tracks to the format expected by TrackList component
  const formattedTracks = tracks.map(track => ({
    id: track.track_number,
    title: track.title,
    artist: track.artist,
    plays: track.plays.toLocaleString(),
    duration: track.duration,
    isLiked: track.is_liked,
    trackId: track.id
  }));

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <AlbumNavigation onGoBack={handleGoBack} />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-accent"></div>
        </div>
      ) : album ? (
        <div className={`flex ${isMobile ? 'flex-col' : 'md:flex-row'} gap-6`}>
          <div className="flex-1">
            <AlbumHeader 
              image={album.image_url}
              title={album.title}
              artist={album.artist}
              year={album.year || ""}
              trackCount={album.track_count || `${tracks.length} songs`}
              duration={album.duration || ""}
            />
            
            <AlbumActions albumId={id} />
            
            <TrackList 
              tracks={formattedTracks} 
              onToggleLike={handleToggleLike}
            />
          </div>
          
          <RelatedAlbums album={album} isMobile={isMobile} />
        </div>
      ) : (
        <AlbumNotFound onGoBack={handleGoBack} />
      )}
    </div>
  );
};

export default Album;
