
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const location = useLocation();
  const shouldHidePlayer = location.pathname.includes('/blog');

  useEffect(() => {
    const handleTrackSelected = (event: CustomEvent) => {
      const track = event.detail as Track;
      console.log("Player received track selection event:", track.title);
      setCurrentTrack(track);
    };
    
    const handlePlayTrack = (event: CustomEvent) => {
      const detail = event.detail;
      if (detail && detail.immediate) {
        console.log("Received immediate play command");
        // This would trigger play in a child component
        const audioElement = document.querySelector('audio');
        if (audioElement) {
          audioElement.play()
            .catch(err => console.error("Error playing audio:", err));
        }
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
    <div className="fixed bottom-0 w-full h-20 bg-black border-t border-zinc-800 shadow-lg z-50 py-[8px] px-[3px]">
      <PlayerContent currentTrack={currentTrack} />
    </div>
  );
};

export default Player;
