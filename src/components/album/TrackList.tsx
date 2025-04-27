import React from 'react';
import { Clock, MoreHorizontal, Heart, Play, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddToPlaylistButton from '@/components/playlist/AddToPlaylistButton';
import { Track as TrackType } from '@/types/supabase';
import { Button } from '@/components/ui/button';
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
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
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
        console.log("Dispatching track for playback:", fullTrack);

        // First dispatch track selected event to load the track
        window.dispatchEvent(new CustomEvent('trackSelected', {
          detail: fullTrack
        }));

        // Add a small delay before triggering playback to ensure the track is loaded
        setTimeout(() => {
          // Then trigger playback with a flag indicating immediate play
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
  return <div className="w-full overflow-x-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="pb-2 w-10 text-spotify-text-secondary text-sm font-normal">  #</th>
            <th className="pb-2 text-spotify-text-secondary text-sm font-normal">Title</th>
            
            <th className="pb-2 w-10 text-spotify-text-secondary text-sm font-normal"></th>
            <th className="pb-2 w-16 text-right text-spotify-text-secondary text-sm font-normal">
              <Clock size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tracks) && tracks.length > 0 ? tracks.map((track, index) => <tr key={track.id || `track-${index}`} className={`group hover:bg-white/5 ${track.isPlaying ? 'text-spotify-accent' : 'text-spotify-text-primary'}`}>
                <td className="py-2 align-middle px-[10px]">
                  <div className="flex items-center">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <button className="hidden group-hover:flex items-center justify-center" onClick={() => handlePlayClick(track)}>
                      <Play size={14} />
                    </button>
                  </div>
                </td>
                
                <td className="flex items-center gap-2 max-w-[250px]">
                  <div className="flex items-center gap-2 max-w-[250px]">
                    <div className="min-w-0">
                      <div className="font-medium truncate text-sm">{track.title}</div>
                      <div className="text-spotify-text-secondary text-xs truncate">{track.artist}</div>
                    </div>
                  </div>
                </td>
                
                
                
                <td className="py-2 align-middle">
                  <div className="flex items-center gap-1">
                    <button className={`${track.isLiked ? 'text-spotify-accent' : 'text-spotify-text-secondary'} ${!track.isLiked ? 'opacity-0 group-hover:opacity-100' : ''} hover:text-white`} onClick={() => track.trackId && handleToggleLike(track.trackId)}>
                      <Heart size={16} fill={track.isLiked ? 'currentColor' : 'none'} />
                    </button>
                    
                    {track.trackId && <>
                        <AddToPlaylistButton trackId={track.trackId} albumName={albumName} />
                        
                        {user && onDeleteTrack && <button className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400" onClick={() => track.trackId && onDeleteTrack(track.trackId)} title="Delete track">
                            <Trash2 size={16} />
                          </button>}
                      </>}
                  </div>
                </td>
                
                <td className="py-2 align-middle text-right pr-2">
                  <div className="py-2 align-middle">
                    <span className="whitespace-nowrap">{track.duration}</span>
                    <button className="text-spotify-text-secondary opacity-0 group-hover:opacity-100 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>) : <tr>
              <td colSpan={5} className="py-8 text-center text-spotify-text-secondary">
                No tracks available for this album. Add some tracks!
              </td>
            </tr>}
        </tbody>
      </table>
      <div className="h-32"></div>
    </div>;
};
export default TrackList;