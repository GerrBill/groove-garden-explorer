
import React, { useState, useEffect } from 'react';
import PlayerContent from './PlayerContent';
import { Track } from '@/types/supabase';

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    // Listen for track selection events
    const handleTrackSelected = (event: any) => {
      const track = event.detail as Track;
      setCurrentTrack(track);
    };

    window.addEventListener('trackSelected', handleTrackSelected);

    return () => {
      window.removeEventListener('trackSelected', handleTrackSelected);
    };
  }, []);

  return (
    <div className="fixed bottom-0 w-full h-24 bg-gradient-to-b from-black/60 to-black border-t border-zinc-800 px-4 py-2">
      <PlayerContent currentTrack={currentTrack} />
    </div>
  );
};

export default Player;
