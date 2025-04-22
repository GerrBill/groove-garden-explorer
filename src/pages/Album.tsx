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
import { useAuth } from "@/context/AuthContext";

interface TrackWithMeta extends Track {
  isLiked?: boolean;
  isPlaying?: boolean;
  trackId: string;
}

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

const Album = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [tracks, setTracks] = useState<TrackWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  const fetchAlbum = async () => {
    if (!id) return;
    
    try {
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();
      
      if (albumError) throw albumError;
      setAlbum(albumData);
      
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true });
      
      if (tracksError) throw tracksError;
      
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

  const handleTrackAdded = (track: Track) => {
    setTracks(prevTracks => [
      ...prevTracks, 
      { 
        ...track, 
        isLiked: false, 
        isPlaying: false, 
        trackId: track.id 
      }
    ]);
    
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

  const handleToggleLike = (trackId: string) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId 
          ? { ...track, isLiked: !track.isLiked } 
          : track
      )
    );
  };

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

  const handleDeleteAlbum = async () => {
    if (!album || !id || !user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this album? This will also delete all associated tracks and remove them from any playlists. This action cannot be undone.");
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      
      const { data: albumTracks, error: tracksError } = await supabase
        .from('tracks')
        .select('id, audio_path')
        .eq('album_id', id);
      
      if (tracksError) throw tracksError;
      
      if (albumTracks && albumTracks.length > 0) {
        const trackIds = albumTracks.map(track => track.id);
        
        const { error: playlistTracksError } = await supabase
          .from('playlist_tracks')
          .delete()
          .in('track_id', trackIds);
        
        if (playlistTracksError) throw playlistTracksError;
        
        for (const track of albumTracks) {
          if (track.audio_path) {
            const { error: storageError } = await supabase.storage
              .from('audio')
              .remove([track.audio_path]);
            
            if (storageError) {
              console.error(`Failed to delete audio file ${track.audio_path}:`, storageError);
            }
          }
        }
        
        const { error: deleteTracksError } = await supabase
          .from('tracks')
          .delete()
          .eq('album_id', id);
        
        if (deleteTracksError) throw deleteTracksError;
      }
      
      if (album.image_url && album.image_url.includes('supabase.co/storage')) {
        try {
          const urlParts = album.image_url.split('/storage/v1/object/public/');
          if (urlParts.length > 1) {
            const pathPart = urlParts[1];
            const [bucket, ...pathSegments] = pathPart.split('/');
            const filePath = pathSegments.join('/');
            
            await supabase.storage
              .from(bucket)
              .remove([filePath]);
          }
        } catch (imageError) {
          console.error('Error deleting album image:', imageError);
        }
      }
      
      const { error: deleteAlbumError } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);
      
      if (deleteAlbumError) throw deleteAlbumError;
      
      toast({
        title: "Album deleted",
        description: "The album and all its tracks have been deleted successfully."
      });
      
      navigate('/');
      
    } catch (error) {
      console.error('Error deleting album:', error);
      toast({
        title: "Error",
        description: "Failed to delete the album. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!trackId || !user) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the track "${track.title}"? This will also remove it from any playlists. This action cannot be undone.`);
    
    if (!confirmDelete) return;
    
    try {
      const { error: playlistTrackError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('track_id', trackId);
      
      if (playlistTrackError) throw playlistTrackError;
      
      if (track.audio_path) {
        const { error: storageError } = await supabase.storage
          .from('audio')
          .remove([track.audio_path]);
        
        if (storageError) {
          console.error(`Failed to delete audio file ${track.audio_path}:`, storageError);
        }
      }
      
      const { error: deleteTrackError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);
      
      if (deleteTrackError) throw deleteTrackError;
      
      setTracks(prevTracks => prevTracks.filter(t => t.id !== trackId));
      
      if (album) {
        const newTrackCount = parseInt(album.track_count || '0', 10) - 1;
        setAlbum({
          ...album,
          track_count: Math.max(0, newTrackCount).toString()
        });
      }
      
      toast({
        title: "Track deleted",
        description: `"${track.title}" has been deleted successfully.`
      });
      
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: "Error",
        description: "Failed to delete the track. Please try again.",
        variant: "destructive"
      });
    }
  };

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
            onTrackAdded={isAdmin ? handleTrackAdded : undefined}
            updateAlbumArtDialog={
              isAdmin ? (
                <UpdateAlbumArtDialog 
                  albumId={id}
                  currentImage={album.image_url}
                  onImageUpdated={handleAlbumArtUpdated}
                />
              ) : null
            }
            onDeleteAlbum={isAdmin ? handleDeleteAlbum : undefined}
          />
          
          <ScrollArea className="h-[calc(100vh-280px)]">
            <TrackList 
              tracks={tracks} 
              onToggleLike={handleToggleLike}
              albumName={album.title}
              onDeleteTrack={isAdmin ? handleDeleteTrack : undefined}
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
