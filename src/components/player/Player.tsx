
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

// Declare the window property for TypeScript
declare global {
  interface Window {
    currentTrackToPlay?: Track;
  }
}

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const location = useLocation();
  const shouldHidePlayer = location.pathname.includes('/blog');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleTrackSelected = (event: CustomEvent) => {
      try {
        const track = event.detail as Track;
        console.log("Player received track selection event:", track.title);
        
        // Check if the track has an audio_path
        if (!track.audio_path) {
          console.error("Track has no audio path:", track);
          toast({
            title: "Playback Error",
            description: "This track doesn't have an audio file associated with it.",
            variant: "destructive"
          });
          return;
        }
        
        // Set the current track
        setCurrentTrack(track);
        
        // Also check if track is available from window object as fallback
        if (!track && window.currentTrackToPlay) {
          console.log("Using track from window object");
          setCurrentTrack(window.currentTrackToPlay);
        }
      } catch (err) {
        console.error("Error handling track selection:", err);
      }
    };
    
    const handlePlayTrack = (event: CustomEvent) => {
      try {
        const detail = event.detail;
        if (detail && detail.immediate) {
          console.log("Received immediate play command");
          // Find audio element and play it
          setTimeout(() => {
            audioRef.current = document.querySelector('audio');
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(err => {
                  console.error("Error playing audio:", err);
                  toast({
                    title: "Playback Error",
                    description: "Could not play the track. Please try again.",
                    variant: "destructive"
                  });
                });
              }
            } else {
              console.error("Audio element not found");
            }
          }, 100); // Small delay to ensure audio element is ready
        }
      } catch (err) {
        console.error("Error handling play track:", err);
      }
    };
    
    // Add event listeners
    window.addEventListener('trackSelected', handleTrackSelected as EventListener);
    window.addEventListener('playTrack', handlePlayTrack as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected as EventListener);
      window.removeEventListener('playTrack', handlePlayTrack as EventListener);
    };
  }, []);

  if (shouldHidePlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full h-20 bg-black border-t border-zinc-800 shadow-lg z-50 py-2 px-4">
      <PlayerContent currentTrack={currentTrack} />
    </div>
  );
};

export default Player;
