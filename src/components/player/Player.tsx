
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const location = useLocation();
  
  // Check if we should hide the player (when on blog pages)
  const shouldHidePlayer = location.pathname.includes('/blog');

  useEffect(() => {
    // Listen for track selection events
    const handleTrackSelected = (event: any) => {
      const track = event.detail as Track;
      setCurrentTrack(track);
    };

    // Listen for play track events
    const handlePlayTrack = () => {
      console.log("Play track event received, playing audio");
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        // Force play with user interaction
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
          });
        }
      }
    };

    window.addEventListener('trackSelected', handleTrackSelected);
    window.addEventListener('playTrack', handlePlayTrack);

    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected);
      window.removeEventListener('playTrack', handlePlayTrack);
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
