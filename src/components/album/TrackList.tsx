import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Heart, Play, Music, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddToPlaylistButton from '@/components/playlist/AddToPlaylistButton';
import { Track as TrackType } from '@/types/supabase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface Track {
  id: string;
  title: string;
  artist: string;
  plays: string | number;
  duration: string;
  isPlaying?: boolean;
  isLiked?: boolean;
  trackId: string;
  audio_path?: string;
}

interface TrackListProps {
  tracks: Track[];
  onToggleLike?: (trackId: string) => void;
  onPlayTrack?: (trackId: string) => void;
  albumName?: string;
  onDeleteTrack?: (trackId: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  onToggleLike,
  onPlayTrack,
  albumName,
  onDeleteTrack
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
  // VU Meter animation state
  const [vuHeights, setVuHeights] = useState<number[]>([20, 40, 30, 50, 25]);

  // Listen for track selection events to update UI
  useEffect(() => {
    const handleTrackSelected = (event: Event) => {
      const trackEvent = event as CustomEvent;
      const track = trackEvent.detail as TrackType;
      setCurrentlyPlayingId(track.id);
    };

    window.addEventListener('trackSelected', handleTrackSelected);
    
    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected);
    };
  }, []);

  // VU meter animation effect
  useEffect(() => {
    if (currentlyPlayingId) {
      const interval = setInterval(() => {
        setVuHeights(prevHeights => 
          prevHeights.map(() => Math.floor(Math.random() * 40) + 20)
        );
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [currentlyPlayingId]);

  const handleToggleLike = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like tracks",
        variant: "destructive"
      });
      return;
    }
    const track = tracks.find(t => t.trackId === trackId);
    if (!track) return;
    const newLikedStatus = !track.isLiked;
    try {
      const {
        error
      } = await supabase.from('tracks').update({
        is_liked: newLikedStatus
      }).eq('id', trackId);
      if (error) throw error;
      const {
        data: prefsData,
        error: prefsError
      } = await supabase.from('user_preferences').select('liked_songs_count').eq('user_id', user.id).single();
      if (prefsError && prefsError.code !== 'PGRST116') {
        throw prefsError;
      }
      const currentCount = prefsData?.liked_songs_count || 0;
      const newCount = newLikedStatus ? currentCount + 1 : Math.max(0, currentCount - 1);
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        liked_songs_count: newCount,
        updated_at: new Date().toISOString()
      });
      if (onToggleLike) {
        onToggleLike(trackId);
      }
      toast({
        title: newLikedStatus ? "Added to Liked Songs" : "Removed from Liked Songs",
        description: `${track.title} has been ${newLikedStatus ? 'added to' : 'removed from'} your Liked Songs`
      });
    } catch (error) {
      console.error('Error toggling track like:', error);
      toast({
        title: "Error",
        description: "Failed to update liked status",
        variant: "destructive"
      });
    }
  };

  const handlePlayClick = (track: Track) => {
    const fetchTrackDetails = async (trackId: string) => {
      try {
        const {
          data,
          error
        } = await supabase.from('tracks').select('*').eq('id', trackId).single();
        if (error) throw error;
        const fullTrack: TrackType = {
          ...data,
          id: data.id,
          title: data.title,
          artist: data.artist,
          album_id: data.album_id,
          duration: data.duration,
          plays: data.plays || 0,
          audio_path: data.audio_path,
          track_number: data.track_number
        };
        
        // Set currently playing track
        setCurrentlyPlayingId(trackId);
        
        console.log("Dispatching track for playback:", fullTrack);
        window.dispatchEvent(new CustomEvent('trackSelected', {
          detail: fullTrack
        }));
        
        // Immediately play the track
        window.dispatchEvent(new CustomEvent('playTrack', {
          detail: { immediate: true }
        }));
      } catch (error) {
        console.error('Error fetching track details:', error);
        toast({
          title: "Error",
          description: "Failed to play track",
          variant: "destructive"
        });
      }
    };
    fetchTrackDetails(track.trackId);
  };

  return (
    <div className="w-full relative">
      <Table>
        <TableHeader className="sticky top-0 bg-zinc-900 z-10">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[5%] px-4">#</TableHead>
            <TableHead className="w-[75%] px-4">Title</TableHead>
            <TableHead className="w-[20%] px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(tracks) && tracks.length > 0 ? tracks.map((track, index) => (
            <TableRow key={track.id || `track-${index}`} className={`group ${track.trackId === currentlyPlayingId ? 'text-spotify-accent' : 'text-spotify-text-primary'}`}>
              <TableCell className="w-[5%] px-4">
                <div className="flex items-center">
                  {track.trackId === currentlyPlayingId ? (
                    // VU Meter animation when track is playing
                    <div className="flex items-end h-4 gap-[2px]">
                      {vuHeights.map((height, i) => (
                        <div 
                          key={i}
                          className="w-[2px] bg-spotify-accent"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button 
                        className="hidden group-hover:flex items-center justify-center" 
                        onClick={() => handlePlayClick(track)}
                      >
                        <Play size={14} />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="w-[75%] px-4">
                <div className="min-w-0 truncate">
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-zinc-400 text-xs truncate">{track.artist}</div>
                </div>
              </TableCell>
              <TableCell className="w-[20%] px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className={`${track.isLiked ? 'text-spotify-accent' : 'text-zinc-400'} ${!track.isLiked ? 'opacity-0 group-hover:opacity-100' : ''} hover:text-white`} onClick={() => track.trackId && handleToggleLike(track.trackId)}>
                    <Heart size={16} fill={track.isLiked ? 'currentColor' : 'none'} />
                  </button>
                  
                  {track.trackId && (
                    <>
                      <AddToPlaylistButton trackId={track.trackId} albumName={albumName} />
                      {user && onDeleteTrack && (
                        <button 
                          className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400" 
                          onClick={() => track.trackId && onDeleteTrack(track.trackId)} 
                          aria-label="Delete track"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                No tracks available for this album. Add some tracks!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="h-12"></div>
    </div>
  );
};

export default TrackList;
