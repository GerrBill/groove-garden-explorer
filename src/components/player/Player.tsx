
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';

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
        return;
      }
      
      // Create full audio URL if it's just a path
      const fullAudioUrl = track.audio_path.startsWith('http') 
        ? track.audio_path 
        : `https://wiisixdctrokfmhnrxnw.supabase.co/storage/v1/object/public/audio/${track.audio_path}`;
      
      // Update track with full audio URL
      setCurrentTrack({
        ...track,
        audio_path: fullAudioUrl
      });
    };
    
    const handlePlayTrack = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail && detail.immediate) {
        console.log("Received immediate play command");
        // Trigger play in AudioPlayer component via the audio element
        if (audioRef.current) {
          audioRef.current.play()
            .catch(err => console.error("Error playing audio:", err));
        }
      }
    };
    
    // Create an audio element reference for direct control
    audioRef.current = document.querySelector('audio');
    
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
    <div className="fixed bottom-0 w-full h-20 bg-black border-t border-zinc-800 shadow-lg z-50 py-[8px] px-[3px]">
      <PlayerContent currentTrack={currentTrack} />
    </div>
  );
};

export default Player;
