import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAlbumData } from '@/hooks/use-album-data';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/album/TrackList';
import AlbumNavigation from '@/components/album/AlbumNavigation';
import AlbumActions from '@/components/album/AlbumActions';
import AlbumNotFound from '@/components/album/AlbumNotFound';
import UpdateAlbumArtDialog from '@/components/album/UpdateAlbumArtDialog';
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Track } from '@/types/supabase';
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { album, tracks, loading, setTracks, refetch } = useAlbumData(id);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTrackAdded = (newTrack: Track) => {
    setTracks(prevTracks => [...prevTracks, newTrack]);
    refetch();
    toast({
      title: "Success",
      description: "Track added successfully!",
      duration: 3000
    });
  };

  const handleAlbumArtUpdated = (newImageUrl: string) => {
    refetch();
    toast({
      title: "Success",
      description: "Album art updated successfully!",
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
      updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], is_liked: !newLikedStatus };
      setTracks(updatedTracks);
    }
  };

  const handlePlayTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      setSelectedTrack(track);
      window.dispatchEvent(new CustomEvent('trackSelected', { detail: track }));
    }
  };

  useEffect(() => {
    console.log('Raw tracks data:', tracks);
  }, [tracks]);

  const formattedTracks = tracks.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    plays: track.plays || 0,
    duration: track.duration,
    isLiked: track.is_liked,
    trackId: track.id
  }));

  useEffect(() => {
    if (tracks.length > 0) {
      console.log('Tracks available:', tracks);
      console.log('Formatted tracks:', formattedTracks);
    }
  }, [tracks, formattedTracks]);

  return (
    <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
      <div className="pb-40">
        <AlbumNavigation onGoBack={handleGoBack} />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-accent"></div>
          </div>
        ) : album ? (
          <div className="flex flex-col">
            <AlbumHeader 
              image={album.image_url}
              title={album.title}
              artist={album.artist}
              year={album.year || ""}
              trackCount={tracks.length > 0 ? `${tracks.length} songs` : album.track_count || "No tracks"}
              duration={album.duration || ""}
            />
            
            <AlbumActions 
              albumId={id} 
              onTrackAdded={handleTrackAdded}
              updateAlbumArtDialog={
                <UpdateAlbumArtDialog 
                  albumId={id || ''} 
                  currentImage={album.image_url}
                  onImageUpdated={handleAlbumArtUpdated}
                />
              }
            />
            
            <div className="px-6 py-4 flex-grow">
              <TrackList 
                tracks={formattedTracks} 
                onToggleLike={handleToggleLike}
                onPlayTrack={handlePlayTrack}
              />
            </div>
            
            <div className="h-24"></div>
          </div>
        ) : (
          <AlbumNotFound onGoBack={handleGoBack} />
        )}
      </div>
    </ScrollArea>
  );
};

export default Album;
