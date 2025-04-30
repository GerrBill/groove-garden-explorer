import React from 'react';
import { MoreHorizontal, Heart, Play, Music, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Track as TrackType } from '@/types/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";

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
        console.log("Dispatching playlist track for playback:", fullTrack);
        window.dispatchEvent(new CustomEvent('trackSelected', {
          detail: fullTrack
        }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('playTrack', {
            detail: {
              immediate: true
            }
          }));
        }, 100);
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
            <TableHead className="w-[55%] px-4">Title</TableHead>
            <TableHead className="w-[25%] hidden md:table-cell px-4">Album</TableHead>
            <TableHead className="w-[15%] px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="w-[5%] px-4">
                  <div className="w-6 h-6 bg-zinc-800 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="w-[55%] px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 animate-pulse rounded"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-zinc-800 animate-pulse rounded"></div>
                      <div className="w-16 h-3 bg-zinc-800 animate-pulse rounded"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[25%] hidden md:table-cell px-4">
                  <div className="w-20 h-4 bg-zinc-800 animate-pulse rounded"></div>
                </TableCell>
                <TableCell className="w-[15%] px-4"></TableCell>
              </TableRow>
            ))
          ) : tracks.length > 0 ? (
            tracks.map(track => (
              <TableRow key={track.id} className={`group ${track.isPlaying ? 'text-orange-600' : 'text-white'}`}>
                <TableCell className="w-[5%] px-4">
                  <div className="flex items-center">
                    <span className="group-hover:hidden">{track.position}</span>
                    <button className="hidden group-hover:flex items-center justify-center" onClick={() => handlePlayClick(track)}>
                      <Play size={14} />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="w-[55%] px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center rounded shrink-0">
                      <Music size={16} className="text-zinc-400" />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-medium truncate">{track.title}</div>
                      <div className="text-zinc-400 text-xs truncate">{track.artist}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[25%] hidden md:table-cell text-zinc-400 truncate px-4">
                  {track.albumName || 'Unknown Album'}
                </TableCell>
                <TableCell className="w-[15%] px-4 text-right">
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
              <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
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
