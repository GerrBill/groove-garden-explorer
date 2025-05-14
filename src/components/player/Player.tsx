
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const location = useLocation();
  const shouldHidePlayer = location.pathname.includes('/blog');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleTrackSelected = (event: CustomEvent) => {
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
      
      // Set the current track - audio_path should already be complete
      setCurrentTrack(track);
    };
    
    const handlePlayTrack = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail && detail.immediate) {
        console.log("Received immediate play command");
        // Find audio element and play it
        setTimeout(() => {
          audioRef.current = document.querySelector('audio');
          if (audioRef.current) {
            audioRef.current.play()
              .catch(err => {
                console.error("Error playing audio:", err);
                toast({
                  title: "Playback Error",
                  description: "Could not play the track. Please try again.",
                  variant: "destructive"
                });
              });
          }
        }, 100); // Small delay to ensure audio element is ready
      }
    };
    
    window.addEventListener('trackSelected', handleTrackSelected as EventListener);
    window.addEventListener('playTrack', handlePlayTrack as EventListener);
    
    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected as EventListener);
      window.removeEventListener('playTrack', handlePlayTrack as EventListener);
    };
  }, []);

  if (shouldHidePlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full h-16 bg-black border-t border-zinc-800 shadow-lg z-50 py-[6px] px-[10px]">
      <PlayerContent currentTrack={currentTrack} />
    </div>
  );
};

export default Player;
