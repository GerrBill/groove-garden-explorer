
import React, { useState } from 'react';
import { Heart, Play, Download, MoreHorizontal, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  album_id: string;
  duration: string;
  plays: number;
  audio_path: string;
  track_number: number;
  album_name?: string;
  is_liked?: boolean;
  created_at?: string;
}

interface PlaylistTracklistProps {
  tracks: PlaylistTrack[];
  playlistId: string;
  canEdit?: boolean;
  onRemoveTrack?: (trackId: string) => void;
}

const PlaylistTracklist: React.FC<PlaylistTracklistProps> = ({ 
  tracks, 
  playlistId, 
  canEdit = true,
  onRemoveTrack
}) => {
  const { user } = useAuth();
  const [loadingLike, setLoadingLike] = useState<string | null>(null);
  const [loadingRemove, setLoadingRemove] = useState<string | null>(null);

  const handlePlay = (track: PlaylistTrack) => {
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
    const fullAudioUrl = track.audio_path?.startsWith('http') 
      ? track.audio_path 
      : `https://wiisixdctrokfmhnrxnw.supabase.co/storage/v1/object/public/audio/${track.audio_path}`;
    
    // Create the track object with all required properties
    const trackForPlayer = {
      ...track,
      audio_path: fullAudioUrl,
      is_liked: track.is_liked || false,
      created_at: track.created_at || new Date().toISOString()
    };
    
    console.log("Playing track:", trackForPlayer);
    
    // Include all required Track properties when dispatching the event
    window.dispatchEvent(
      new CustomEvent('trackSelected', {
        detail: trackForPlayer
      })
    );
    
    // Trigger immediate play
    window.dispatchEvent(
      new CustomEvent('playTrack', {
        detail: { immediate: true }
      })
    );
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
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{track.title}</td>
              <td className="px-6 py-4">{track.artist}</td>
              {tracks.some(track => track.album_name) && (
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaylistTracklist;
