
import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, Play, Music, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Track as TrackType } from '@/types/supabase';

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  plays: number | string;
  duration: string;
  isPlaying?: boolean;
  isLiked?: boolean;
  trackId: string;
  albumName?: string | null;
  position: number;
  audio_path?: string;
}

interface PlaylistTracklistProps {
  tracks: PlaylistTrack[];
  isLoading: boolean;
  onRemoveTrack?: (trackId: string) => void;
}

const PlaylistTracklist: React.FC<PlaylistTracklistProps> = ({
  tracks,
  isLoading,
  onRemoveTrack
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

  const handlePlayClick = (track: PlaylistTrack) => {
    console.log("Play button clicked for playlist track:", track.title);
    
    // Create a full track object with essential properties
    const fullTrack: TrackType = {
      id: track.trackId,
      title: track.title,
      artist: track.artist,
      album_id: "", // Default value
      duration: track.duration,
      plays: Number(track.plays) || 0,
      audio_path: track.audio_path || "",
      track_number: track.position || 0
    };
    
    // Set currently playing track
    setCurrentlyPlayingId(track.trackId);
    
    console.log("Dispatching playlist track for playback:", fullTrack);
    window.dispatchEvent(new CustomEvent('trackSelected', {
      detail: fullTrack
    }));
    
    // Play the track immediately
    window.dispatchEvent(new CustomEvent('playTrack', {
      detail: { immediate: true }
    }));
  };

  return (
    <div className="w-full relative">
      <Table>
        <TableHeader className="sticky top-0 bg-black z-10">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[5%] px-4">#</TableHead>
            <TableHead className="w-[75%] px-4">Title</TableHead>
            <TableHead className="w-[20%] px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="w-[5%] px-4">
                  <div className="w-6 h-6 bg-black animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="w-[75%] px-4">
                  <div className="flex items-center gap-3">
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-black animate-pulse rounded"></div>
                      <div className="w-16 h-3 bg-black animate-pulse rounded"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[20%] px-4"></TableCell>
              </TableRow>
            ))
          ) : tracks.length > 0 ? (
            tracks.map(track => (
              <TableRow key={track.id} className={`group ${track.trackId === currentlyPlayingId ? 'text-orange-600' : 'text-white'} hover:bg-black/30`}>
                <TableCell className="w-[5%] px-4 bg-black/50">
                  <div className="flex items-center">
                    {track.trackId === currentlyPlayingId ? (
                      // VU Meter animation when track is playing
                      <div className="flex items-end h-4 gap-[2px]">
                        {vuHeights.map((height, i) => (
                          <div 
                            key={i}
                            className="w-[2px] bg-orange-600"
                            style={{ height: `${height}%` }}
                          ></div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <span className="group-hover:hidden">{track.position}</span>
                        <button className="hidden group-hover:flex items-center justify-center" onClick={() => handlePlayClick(track)}>
                          <Play size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[75%] px-4 bg-black/50">
                  <div className="min-w-0 truncate">
                    <div className="font-medium truncate">{track.title}</div>
                    <div className="text-zinc-400 text-xs truncate">{track.artist}</div>
                  </div>
                </TableCell>
                <TableCell className="w-[20%] px-4 text-right bg-black/50">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className={`${track.isLiked ? 'text-orange-600' : 'text-zinc-400'} ${!track.isLiked ? 'opacity-0 group-hover:opacity-100' : ''} hover:text-white`} 
                      onClick={() => handleToggleLike(track.trackId)}
                    >
                      <Heart size={16} fill={track.isLiked ? 'currentColor' : 'none'} />
                    </button>
                    
                    {onRemoveTrack && (
                      <button 
                        className="text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white" 
                        onClick={() => onRemoveTrack(track.id)} 
                        aria-label="Remove from playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    <button className="text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-zinc-400 py-8 bg-black/50">
                This playlist doesn't have any tracks yet. Start adding some tracks!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="h-4"></div>
    </div>
  );
};

export default PlaylistTracklist;
