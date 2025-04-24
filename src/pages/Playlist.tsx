
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import PlaylistTracklist from '@/components/playlist/PlaylistTracklist';
import PlaylistHeader from '@/components/playlist/PlaylistHeader';
import { Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  owner: string;
  created_at: string;
}

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  plays: number;
  duration: string;
  trackId: string;
  albumName: string | null;
  position: number;
}

const Playlist = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchPlaylistDetails();
      fetchPlaylistTracks();
    }
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setPlaylist(data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast({
        title: "Error",
        description: "Failed to load playlist details",
        variant: "destructive"
      });
    }
  };

  const fetchPlaylistTracks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          id,
          position,
          album_name,
          tracks (
            id,
            title,
            artist,
            plays,
            duration,
            is_liked
          )
        `)
        .eq('playlist_id', id)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      // Transform data into the format expected by TrackList
      const formattedTracks = data.map(item => ({
        id: item.id,
        title: item.tracks.title,
        artist: item.tracks.artist,
        plays: item.tracks.plays || 0,
        duration: item.tracks.duration,
        isLiked: item.tracks.is_liked || false,
        trackId: item.tracks.id,
        albumName: item.album_name,
        position: item.position
      }));
      
      setTracks(formattedTracks);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load playlist tracks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrack = async (playlistTrackId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('id', playlistTrackId);
      
      if (error) throw error;
      
      // Refresh playlist tracks
      fetchPlaylistTracks();
      
      toast({
        title: "Track Removed",
        description: "Track removed from playlist",
      });
    } catch (error) {
      console.error('Error removing track:', error);
      toast({
        title: "Error",
        description: "Failed to remove track from playlist",
        variant: "destructive"
      });
    }
  };

  if (!playlist && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Playlist Not Found</h2>
        <p className="text-zinc-400 mb-4">The playlist you're looking for doesn't exist or has been removed.</p>
        <Button asChild variant="outline">
          <a href="/">Go back to home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden w-full pb-24">
      {playlist && (
        <div className="container mx-auto px-4 md:px-0 md:max-w-none">
          <PlaylistHeader
            title={playlist.title}
            description={playlist.description}
            imageUrl={playlist.image_url}
            owner={playlist.owner}
            trackCount={tracks.length}
          />
          
          <div className="px-6 py-4 flex items-center gap-8 mb-4">
            <button 
              className="w-10 h-10 flex items-center justify-center border border-zinc-700 rounded-full hover:border-white hover:scale-105 transition"
              aria-label="Like playlist"
            >
              <Heart size={20} />
            </button>
            
            <button 
              className="w-10 h-10 flex items-center justify-center hover:text-white ml-auto"
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="md:pl-0 pl-4">
            <PlaylistTracklist 
              tracks={tracks} 
              isLoading={loading}
              onRemoveTrack={handleRemoveTrack}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;
