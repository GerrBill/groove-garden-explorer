
import React from 'react';
import { Clock, MoreHorizontal, Heart, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  plays: string | number;
  duration: string;
  isPlaying?: boolean;
  isLiked?: boolean;
  trackId: string;
}

interface TrackListProps {
  tracks: Track[];
  onToggleLike?: (trackId: string) => void;
  onPlayTrack?: (trackId: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onToggleLike, onPlayTrack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Updated function to handle track likes with user association
  const handleToggleLike = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like tracks",
        variant: "destructive",
      });
      return;
    }
    
    // Find the track in the list to get its current like status
    const track = tracks.find(t => t.trackId === trackId);
    if (!track) return;
    
    const newLikedStatus = !track.isLiked;
    
    try {
      // Update the track in the database
      const { error } = await supabase
        .from('tracks')
        .update({ is_liked: newLikedStatus })
        .eq('id', trackId);
      
      if (error) throw error;
      
      // Update the liked_songs count in the user_preferences table
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('liked_songs_count')
        .eq('user_id', user.id)
        .single();
      
      if (prefsError && prefsError.code !== 'PGRST116') {
        throw prefsError;
      }
      
      // Safely access the liked_songs_count
      const currentCount = prefsData?.liked_songs_count || 0;
      const newCount = newLikedStatus ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      // Upsert the user preferences with the new count
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          liked_songs_count: newCount,
          updated_at: new Date().toISOString()
        });
      
      // Call the parent component's onToggleLike if provided
      if (onToggleLike) {
        onToggleLike(trackId);
      }
      
      toast({
        title: newLikedStatus ? "Added to Liked Songs" : "Removed from Liked Songs",
        description: `${track.title} has been ${newLikedStatus ? 'added to' : 'removed from'} your Liked Songs`,
      });
    } catch (error) {
      console.error('Error toggling track like:', error);
      toast({
        title: "Error",
        description: "Failed to update liked status",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 border-b border-zinc-800 pb-2 mb-4 px-4 text-spotify-text-secondary text-sm">
        <div>#</div>
        <div>Title</div>
        <div className="hidden md:block">Plays</div>
        <div className="hidden md:block"></div>
        <div className="flex justify-end">
          <Clock size={16} />
        </div>
      </div>
      
      {Array.isArray(tracks) && tracks.length > 0 ? (
        <div className="space-y-1 mb-8">
          {tracks.map((track, index) => (
            <div 
              key={track.id || `track-${index}`}
              className={`grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md text-sm hover:bg-white/5 group ${
                track.isPlaying ? 'text-spotify-accent' : 'text-spotify-text-primary'
              }`}
            >
              <div className="flex items-center">
                <span className="group-hover:hidden">{index + 1}</span>
                <button 
                  className="hidden group-hover:flex items-center justify-center"
                  onClick={() => onPlayTrack && track.trackId && onPlayTrack(track.trackId)}
                >
                  <Play size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="min-w-0">
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-spotify-text-secondary text-xs">{track.artist}</div>
                </div>
              </div>
              
              <div className="flex items-center text-spotify-text-secondary hidden md:flex">
                {typeof track.plays === 'number' ? track.plays.toLocaleString() : track.plays}
              </div>
              
              <div className="flex items-center justify-end">
                <button 
                  className={`${track.isLiked ? 'text-spotify-accent' : 'text-spotify-text-secondary'} ${!track.isLiked ? 'opacity-0 group-hover:opacity-100' : ''} hover:text-white`}
                  onClick={() => track.trackId && handleToggleLike(track.trackId)}
                >
                  <Heart size={16} fill={track.isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span>{track.duration}</span>
                <button className="text-spotify-text-secondary opacity-0 group-hover:opacity-100 hover:text-white">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-spotify-text-secondary mb-16">
          No tracks available for this album. Add some tracks!
        </div>
      )}
    </div>
  );
};

export default TrackList;
