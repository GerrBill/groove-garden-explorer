import React, { useState } from 'react';
import { Heart, Play, Download, MoreHorizontal, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";
import AddToPlaylistButton from '@/components/playlist/AddToPlaylistButton';

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
  const [downloadingTrack, setDownloadingTrack] = useState<string | null>(null);

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
    
    console.log("Play track with URL:", fullAudioUrl);
    
    // Create a complete track object with guaranteed full URL
    const trackToPlay = {
      ...track,
      audio_path: fullAudioUrl
    };
    
    try {
      // Set directly to global window object for more reliable event handling
      window.currentTrackToPlay = trackToPlay;
      
      // DIRECT APPROACH: Use the global play function
      if (window.playTrack) {
        console.log("Using global playTrack function");
        window.playTrack(trackToPlay);
      } else {
        // FALLBACK: Legacy event dispatching approach
        console.log("Fallback to event approach");
        
        const trackEvent = new CustomEvent('trackSelected', {
          detail: trackToPlay
        });
        window.dispatchEvent(trackEvent);
      }
      
      console.log("Track playback initiated");
    } catch (err) {
      console.error("Error playing track:", err);
      toast({
        title: "Playback Error",
        description: "Failed to start playback. Please try again.",
        variant: "destructive"
      });
    }
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

  const handleDownload = async (track: Track) => {
    if (!track.audio_path) {
      toast({
        title: "Download Error",
        description: "This track doesn't have an audio file available for download.",
        variant: "destructive"
      });
      return;
    }

    setDownloadingTrack(track.id);

    try {
      const audioUrl = `https://wiisixdctrokfmhnrxnw.supabase.co/storage/v1/object/public/audio/${track.audio_path}`;
      
      // Fetch the file as a blob
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch the audio file');
      }
      
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download Started",
        description: `"${track.title}" is being downloaded.`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the track. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingTrack(null);
    }
  };

  return (
    <ScrollArea className="h-[500px] w-full">
      <div className="w-full">
        <table className="w-full text-sm text-left text-zinc-400">
          <thead className="text-xs text-zinc-700 uppercase bg-zinc-900 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-2 py-3 w-10"></th>
              <th scope="col" className="px-2 py-3 w-10">#</th>
              <th scope="col" className="px-6 py-3 w-1/2">Title</th>
              <th scope="col" className="px-6 py-3">Artist</th>
              {tracks.some(track => track.album_name) && (
                <th scope="col" className="px-6 py-3">Album</th>
              )}
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={track.id} className="bg-zinc-800 border-b border-zinc-700 hover:bg-zinc-700 h-14">
                <td className="px-2 py-4 text-center">
                  <button
                    onClick={() => handlePlay(track)}
                    className="text-zinc-400 hover:text-white"
                    aria-label={`Play ${track.title}`}
                    data-track-id={track.id}
                  >
                    <Play size={15} />
                  </button>
                </td>
                <td className="px-2 py-4 text-center">{track.track_number || index + 1}</td>
                <td className="px-6 py-4 font-medium text-white truncate max-w-0">{track.title}</td>
                <td className="px-6 py-4 truncate max-w-0">{track.artist}</td>
                {tracks.some(t => t.album_name) && (
                  <td className="px-6 py-4 truncate max-w-0">{track.album_name}</td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleLike(track)}
                      className={`text-zinc-400 hover:text-white ${loadingLike === track.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={loadingLike === track.id}
                    >
                      {loadingLike === track.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart size={15} fill={track.is_liked ? 'currentColor' : 'none'} color={track.is_liked ? '#1DB954' : 'currentColor'} />
                      )}
                    </button>
                    {track.audio_path && (
                      <button
                        onClick={() => handleDownload(track)}
                        className={`text-zinc-400 hover:text-white ${downloadingTrack === track.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={downloadingTrack === track.id}
                        aria-label={`Download ${track.title}`}
                      >
                        {downloadingTrack === track.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Download size={15} />
                        )}
                      </button>
                    )}
                    {albumId && !canEdit && (
                      <AddToPlaylistButton 
                        trackId={track.id} 
                        albumName={track.album_name}
                      />
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
                          <X size={15} />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="h-16" />
      </div>
    </ScrollArea>
  );
};

export default TrackList;
