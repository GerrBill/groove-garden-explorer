
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const location = useLocation();
  
  // Check if we should hide the player (only on blog pages)
  const shouldHidePlayer = location.pathname.includes('/blog');

  useEffect(() => {
    // Listen for track selection events
    const handleTrackSelected = (event: CustomEvent) => {
      const track = event.detail as Track;
      console.log("Player received track selection event:", track.title);
      setCurrentTrack(track);
    };

    window.addEventListener('trackSelected', handleTrackSelected as EventListener);
    
    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected as EventListener);
    };
  }, []);

  // If we're on a blog page, don't render the player
  if (shouldHidePlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full h-24 bg-black border-t border-zinc-800 px-4 py-2 shadow-lg z-50">
      <PlayerContent currentTrack={currentTrack} />
    </div>
  );
};

export default Player;
