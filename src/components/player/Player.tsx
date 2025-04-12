
import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2, ListMusic } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const duration = 213; // Song duration in seconds (3:33)
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Check if screen is under 700px
  useEffect(() => {
    const checkWidth = () => {
      setIsCompact(window.innerWidth < 700);
    };
    
    // Set initial value
    checkWidth();
    
    // Add listener for resize
    window.addEventListener('resize', checkWidth);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkWidth);
  }, []);
  
  return (
    <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 justify-between fixed bottom-0 left-0 right-0">
      {/* Currently playing song */}
      <div className={`flex items-center gap-4 ${isCompact ? 'w-1/3' : 'w-1/4'}`}>
        {!isCompact && (
          <img
            src="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
            alt="Album cover"
            className="h-14 w-14 rounded object-cover"
          />
        )}
        <div>
          <p className="text-sm font-medium">Live From Earth</p>
          <p className="text-xs text-spotify-text-secondary">Jack Pearson</p>
        </div>
      </div>
      
      {/* Playback controls */}
      <div className={`flex flex-col items-center gap-2 ${isCompact ? 'w-2/3' : 'w-2/4'}`}>
        <div className="flex items-center gap-4">
          <button className="text-spotify-text-secondary hover:text-white">
            <Shuffle size={18} />
          </button>
          <button className="text-spotify-text-secondary hover:text-white">
            <SkipBack size={18} />
          </button>
          <button 
            className="bg-white text-black rounded-full p-2 hover:scale-105 transition"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="text-spotify-text-secondary hover:text-white">
            <SkipForward size={18} />
          </button>
          <button className="text-spotify-text-secondary hover:text-white">
            <Repeat size={18} />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-spotify-text-secondary">{formatTime(currentTime)}</span>
          <div className="h-1 rounded-full bg-zinc-700 flex-grow overflow-hidden group">
            <div 
              className="h-full bg-white group-hover:bg-spotify-accent"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-xs text-spotify-text-secondary">{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Volume controls - hidden on small screens */}
      {!isCompact && (
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <button className="text-spotify-text-secondary hover:text-white">
            <ListMusic size={18} />
          </button>
          <button className="text-spotify-text-secondary hover:text-white">
            <Volume2 size={18} />
          </button>
          <div className="w-24 h-1 rounded-full bg-zinc-700 overflow-hidden group">
            <div 
              className="h-full bg-white group-hover:bg-spotify-accent"
              style={{ width: '60%' }}
            />
          </div>
          <button className="text-spotify-text-secondary hover:text-white">
            <Maximize2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Player;
