
import React, { useState } from 'react';
import { Heart, Play, Download, MoreHorizontal, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/supabase';

interface TrackListProps {
  tracks: Track[];
  albumId?: string;
  canEdit?: boolean;
  onRemoveTrack?: (trackId: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({ 
  tracks, 
  albumId,
  canEdit = false,
  onRemoveTrack
}) => {
  const { user } = useAuth();
  const [loadingLike, setLoadingLike] = useState<string | null>(null);
  const [loadingRemove, setLoadingRemove] = useState<string | null>(null);

  const handlePlay = (track: Track) => {
    // Check if track has audio path
    if (!track.audio_path) {
      toast({
        title: "Playback Error",
        description: "This track doesn't have an audio file associated with it.",
        variant: "destructive"
      });
      return;
    }
    
    // Create full audio URL if needed
    const fullAudioUrl = track.audio_path.startsWith('http') 
      ? track.audio_path 
      : `https://wiisixdctrokfmhnrxnw.supabase.co/storage/v1/object/public/audio/${track.audio_path}`;
    
    console.log("Play track:", track.title, "with URL:", fullAudioUrl);
    
    // Create a complete track object with all required properties
    const trackToPlay = {
      ...track,
      audio_path: fullAudioUrl
    };
    
    // Dispatch the event with the complete track object
    window.dispatchEvent(
      new CustomEvent('trackSelected', {
        detail: trackToPlay
      })
    );
    
    // Trigger immediate play
    window.dispatchEvent(
      new CustomEvent('playTrack', {
        detail: { immediate: true }
      })
    );
  };

  const toggleLike = async (track: Track) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to like tracks.",
      });
      return;
    }

    setLoadingLike(track.id);
    
    try {
      // This would normally interact with a liked_tracks table
      // Since we don't have access to that table, we'll simulate the behavior
      console.log("Would toggle like for track:", track.id);
      
      // Display toast for user feedback
      if (track.is_liked) {
        toast({
          title: "Track unliked",
          description: `You have removed "${track.title}" from your liked songs.`,
        });
      } else {
        toast({
          title: "Track liked",
          description: `You have added "${track.title}" to your liked songs.`,
        });
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update like status.",
        variant: "destructive",
      });
    } finally {
      setLoadingLike(null);
    }
  };

  const handleRemoveFromPlaylist = async (trackId: string) => {
    if (!onRemoveTrack) return;

    setLoadingRemove(trackId);
    try {
      onRemoveTrack(trackId);
    } catch (error) {
      console.error("Failed to remove track:", error);
      toast({
        title: "Error",
        description: "Failed to remove track from playlist.",
        variant: "destructive"
      });
    } finally {
      setLoadingRemove(null);
    }
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-zinc-400">
        <thead className="text-xs text-zinc-700 uppercase bg-zinc-900">
          <tr>
            <th scope="col" className="px-6 py-3">#</th>
            <th scope="col" className="px-6 py-3">Title</th>
            <th scope="col" className="px-6 py-3">Artist</th>
            {tracks.some(track => track.album_name) && (
              <th scope="col" className="px-6 py-3">Album</th>
            )}
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr key={track.id} className="bg-zinc-800 border-b border-zinc-700 hover:bg-zinc-700">
              <td className="px-6 py-4">{track.track_number || index + 1}</td>
              <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{track.title}</td>
              <td className="px-6 py-4">{track.artist}</td>
              {tracks.some(t => t.album_name) && (
                <td className="px-6 py-4">{track.album_name}</td>
              )}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePlay(track)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Play size={20} />
                  </button>
                  <button
                    onClick={() => toggleLike(track)}
                    className={`text-zinc-400 hover:text-white ${loadingLike === track.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loadingLike === track.id}
                  >
                    {loadingLike === track.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart size={20} fill={track.is_liked ? 'currentColor' : 'none'} color={track.is_liked ? '#1DB954' : 'currentColor'} />
                    )}
                  </button>
                  {track.audio_path && (
                    <a 
                      href={`https://wiisixdctrokfmhnrxnw.supabase.co/storage/v1/object/public/audio/${track.audio_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-zinc-400 hover:text-white"
                    >
                      <Download size={20} />
                    </a>
                  )}
                  {canEdit && onRemoveTrack && (
                    <button
                      onClick={() => handleRemoveFromPlaylist(track.id)}
                      className={`text-zinc-400 hover:text-rose-500 ${loadingRemove === track.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={loadingRemove === track.id}
                    >
                      {loadingRemove === track.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <X size={20} />
                      )}
                    </button>
                  )}
                  <button className="text-zinc-400 hover:text-white">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackList;
