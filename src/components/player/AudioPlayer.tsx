
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useAudio } from '@/hooks/use-audio';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioSrc: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
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
    loadError,
    audio
  } = useAudio(audioSrc);

  const [isSeeking, setIsSeeking] = useState(false);
  const [displayVolume, setDisplayVolume] = useState(volume);
  const isMobile = useIsMobile();
  const volumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Log that the audio player has mounted
  useEffect(() => {
    console.log("AudioPlayer mounted with src:", audioSrc);
  }, [audioSrc]);

  // Display error toast if audio fails to load
  useEffect(() => {
    if (loadError) {
      console.error("Audio error:", loadError);
      toast({
        title: "Playback Error",
        description: `Could not play track. ${loadError}`,
        variant: "destructive"
      });
    }
  }, [loadError, toast]);

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
    <div className="flex flex-col w-full max-w-[900px] gap-1">
      {/* Controls, time, and volume in the first row */}
      <div className="flex items-center justify-between w-full mb-1">
        <div className="flex items-center gap-2">
          <button onClick={skipBack} className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack size={isMobile ? 18 : 20} />
          </button>
          <button onClick={togglePlayPause} className="text-white hover:text-theme-color transition-colors">
            {isPlaying ? <Pause size={isMobile ? 22 : 24} /> : <Play size={isMobile ? 22 : 24} />}
          </button>
          <button onClick={skipForward} className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward size={isMobile ? 18 : 20} />
          </button>
          <span className="text-xs text-zinc-400 ml-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center gap-2" ref={volumeRef}>
          <button onClick={toggleMuteHandler} className="text-zinc-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={isMobile ? 16 : 18} /> : <Volume2 size={isMobile ? 16 : 18} />}
          </button>
          <Slider
            defaultValue={[displayVolume]}
            max={1}
            step={0.01}
            value={[displayVolume]}
            onValueChange={handleVolumeChange}
            className="w-20 md:w-28 h-1"
          />
        </div>
      </div>
      
      {/* Seek slider in the second row */}
      <div className="w-full">
        <Slider
          defaultValue={[0]}
          max={duration || 100}
          step={1}
          value={[currentTime]}
          onValueChange={handleSeekChange}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekEnd}
          className="w-full h-1"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
