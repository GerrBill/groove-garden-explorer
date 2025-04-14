
import React from 'react';
import { Clock, MoreHorizontal, Heart, Play, Music, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        variant: "destructive",
      });
      return;
    }
    
    const track = tracks.find(t => t.trackId === trackId);
    if (!track) return;
    
    const newLikedStatus = !track.isLiked;
    
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ is_liked: newLikedStatus })
        .eq('id', trackId);
      
      if (error) throw error;
      
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
      <div className="grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 border-b border-zinc-800 pb-2 mb-4 px-4 text-zinc-400 text-sm">
        <div>#</div>
        <div>Title</div>
        <div className="hidden md:block">Album</div>
        <div className="hidden md:block"></div>
        <div className="flex justify-end">
          <Clock size={16} />
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-1 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md text-sm">
              <div className="w-6 h-6 bg-zinc-800 animate-pulse rounded"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 animate-pulse rounded"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-zinc-800 animate-pulse rounded"></div>
                  <div className="w-16 h-3 bg-zinc-800 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="w-20 h-4 bg-zinc-800 animate-pulse rounded"></div>
              <div></div>
              <div className="w-10 h-4 bg-zinc-800 animate-pulse rounded ml-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1 mb-8">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div 
                key={track.id}
                className={`grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md text-sm hover:bg-white/5 group ${
                  track.isPlaying ? 'text-orange-600' : 'text-white'
                }`}
              >
                <div className="flex items-center">
                  <span className="group-hover:hidden">{track.position}</span>
                  <button 
                    className="hidden group-hover:flex items-center justify-center"
                  >
                    <Play size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center rounded">
                    <Music size={16} className="text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{track.title}</div>
                    <div className="text-zinc-400 text-xs">{track.artist}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-zinc-400 hidden md:flex">
                  {track.albumName || 'Unknown Album'}
                </div>
                
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
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{track.duration}</span>
                  <button className="text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-zinc-400 mb-16">
              This playlist doesn't have any tracks yet. Start adding some tracks!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistTracklist;
