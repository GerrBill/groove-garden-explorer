
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useAudio } from '@/hooks/use-audio';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioSrc: string;
  trackTitle: string;
  trackArtist: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, trackTitle, trackArtist }) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    setVolume,
    skipForward,
    skipBack,
    isMuted,
    toggleMute,
    loadError
  } = useAudio(audioSrc);

  const [isSeeking, setIsSeeking] = useState(false);
  const [displayVolume, setDisplayVolume] = useState(volume);
  const isMobile = useIsMobile();
  const volumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Display error toast if audio fails to load
  useEffect(() => {
    if (loadError) {
      console.error("Audio error:", loadError);
      toast({
        title: "Playback Error",
        description: `Could not play "${trackTitle}". ${loadError}`,
        variant: "destructive"
      });
    }
  }, [loadError, toast, trackTitle]);

  useEffect(() => {
    setDisplayVolume(volume);
  }, [volume]);

  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (newValue: number[]) => {
    if (newValue && newValue[0] !== undefined) {
      seek(newValue[0]);
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const handleVolumeChange = (newValue: number[]) => {
    if (newValue && newValue[0] !== undefined) {
      setVolume(newValue[0]);
      setDisplayVolume(newValue[0]);
    }
  };

  const toggleMuteHandler = () => {
    toggleMute();
  };

  return (
    <div className="flex items-center justify-center w-full gap-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={skipBack} className="text-zinc-400 hover:text-white transition-colors">
          <SkipBack size={isMobile ? 20 : 24} />
        </button>
        <button onClick={togglePlayPause} className="text-white hover:text-theme-color transition-colors">
          {isPlaying ? <Pause size={isMobile ? 28 : 32} /> : <Play size={isMobile ? 28 : 32} />}
        </button>
        <button onClick={skipForward} className="text-zinc-400 hover:text-white transition-colors">
          <SkipForward size={isMobile ? 20 : 24} />
        </button>
      </div>

      {/* Track Info */}
      <div className="hidden md:block">
        <p className="text-sm text-white truncate">{trackTitle}</p>
        <p className="text-xs text-zinc-400 truncate">{trackArtist}</p>
      </div>

      {/* Seek Slider */}
      <div className="flex items-center gap-2 w-40 md:w-64 lg:w-80">
        <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
        <Slider
          defaultValue={[0]}
          max={duration || 100}
          step={1}
          value={[currentTime]}
          onValueChange={handleSeekChange}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekEnd}
          className="flex-grow h-1"
        />
        <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center gap-2" ref={volumeRef}>
        <button onClick={toggleMuteHandler} className="text-zinc-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={isMobile ? 18 : 20} /> : <Volume2 size={isMobile ? 18 : 20} />}
        </button>
        <Slider
          defaultValue={[displayVolume]}
          max={1}
          step={0.01}
          value={[displayVolume]}
          onValueChange={handleVolumeChange}
          className="w-16 md:w-24 h-1"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
