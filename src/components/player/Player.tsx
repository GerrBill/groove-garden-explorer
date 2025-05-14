import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

// Extend Window interface to include our custom method
declare global {
  interface Window {
    playTrack: (track: Track) => void;
    currentTrackToPlay?: Track;
  }
}

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const location = useLocation();
  const shouldHidePlayer = location.pathname.includes('/blog');
  
  // Direct DOM access for audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // ALTERNATIVE APPROACH: Create a global function to play tracks
    window.playTrack = (track: Track) => {
      console.log("Global playTrack called with:", track.title);
      if (!track.audio_path) {
        console.error("Track has no audio path:", track);
        toast({
          title: "Playback Error",
          description: "This track doesn't have an audio file associated with it.",
          variant: "destructive"
        });
        return;
      }
      
      setCurrentTrack(track);
      
      // Give time for the audio element to be created
      setTimeout(() => {
        try {
          // Find and play the audio element
          const audioElement = document.querySelector('audio');
          if (audioElement) {
            audioRef.current = audioElement;
            console.log("Found audio element, attempting to play");
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.error("Error auto-playing audio:", err);
                toast({
                  title: "Playback Error",
                  description: "Could not auto-play the track. Try clicking play.",
                  variant: "destructive"
                });
              });
            }
          } else {
            console.error("Audio element not found");
          }
        } catch (err) {
          console.error("Error in play timeout:", err);
        }
      }, 200);
    };

    // Legacy approach via events (keep as fallback)
    const handleTrackSelected = (event: CustomEvent) => {
      try {
        const track = event.detail as Track;
        console.log("Player received track selection event:", track.title);
        window.playTrack(track);
      } catch (err) {
        console.error("Error handling track selection:", err);
      }
    };
    
    // Add event listener as fallback
    window.addEventListener('trackSelected', handleTrackSelected as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected as EventListener);
      // @ts-ignore - TypeScript doesn't know about our custom property
      delete window.playTrack;
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
