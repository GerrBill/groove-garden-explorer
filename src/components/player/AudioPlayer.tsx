
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Track } from '@/types/supabase';
import { getAudioUrl } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  track?: Track | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [trackDuration, setTrackDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    toast
  } = useToast();
  const playRequestPending = useRef<boolean>(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log("Audio can play through");
      });
      audioRef.current.addEventListener('error', e => {
        console.error("Audio error:", e);
      });
    }
    const handleEnded = () => {
      setIsPlaying(false);
    };
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    const handleDurationChange = () => {
      if (audioRef.current) {
        setTrackDuration(audioRef.current.duration);
      }
    };
    const audio = audioRef.current;
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    const handlePlayTrack = (event: CustomEvent) => {
      const shouldPlayImmediately = event?.detail?.immediate === true;
      if (audioRef.current && hasAudio) {
        if (shouldPlayImmediately) {
          console.log("Playing track immediately due to tracklist play button");
          playAudio();
        } else {
          console.log("Track loaded but not auto-playing");
        }
      }
    };
    window.addEventListener('playTrack', handlePlayTrack as EventListener);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      window.removeEventListener('playTrack', handlePlayTrack as EventListener);
      audio.pause();
    };
  }, [hasAudio]);

  useEffect(() => {
    if (track?.audio_path && audioRef.current) {
      console.log("Loading audio track:", track.title, track.audio_path);
      const url = getAudioUrl(track.audio_path);
      console.log("Audio URL:", url);
      setAudioUrl(url);
      if (url) {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.crossOrigin = "anonymous";
        setHasAudio(true);
        setIsPlaying(false);
        audioRef.current.load();
        audioRef.current.addEventListener('loadeddata', function onLoaded() {
          console.log("Audio loaded successfully");
          this.removeEventListener('loadeddata', onLoaded);
        });
      } else {
        console.log("No audio URL found for path:", track.audio_path);
        setHasAudio(false);
        toast({
          title: "Playback Error",
          description: "Could not load the audio file",
          variant: "destructive"
        });
      }
    } else {
      setHasAudio(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [track, toast]);

  const playAudio = () => {
    if (!audioRef.current || !hasAudio || playRequestPending.current) return;
    console.log("Attempting to play audio");
    playRequestPending.current = true;
    setIsPlaying(true);
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log("Audio playing successfully");
        playRequestPending.current = false;
      }).catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        playRequestPending.current = false;
        if (error.name !== 'AbortError') {
          toast({
            title: "Playback Error",
            description: "Could not play the audio file: " + error.message,
            variant: "destructive"
          });
        }
      });
    } else {
      playRequestPending.current = false;
    }
  };

  const pauseAudio = () => {
    if (!audioRef.current || !hasAudio) return;
    console.log("Pausing audio");
    audioRef.current.pause();
    setIsPlaying(false);
    playRequestPending.current = false;
  };

  useEffect(() => {
    if (!audioRef.current || !hasAudio) return;
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, hasAudio]);

  const togglePlayPause = () => {
    if (!audioRef.current || !hasAudio) return;
    setIsPlaying(!isPlaying);
  };
  
  const skipBackward = () => {
    if (!audioRef.current || !hasAudio) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };
  
  const skipForward = () => {
    if (!audioRef.current || !hasAudio) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + 10
    );
  };
  
  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current || !hasAudio) return;
    const newPosition = value[0];
    const newTimeInSeconds = (newPosition / 100) * trackDuration;
    audioRef.current.currentTime = newTimeInSeconds;
    setCurrentTime(newTimeInSeconds);
  };

  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;
  
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-[300px]">
      <div className="flex items-center justify-center gap-2 w-full">
        <button 
          className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" 
          onClick={skipBackward}
          disabled={!hasAudio}
        >
          <SkipBack className="w-3 h-3" />
        </button>
        
        <button 
          className={`w-7 h-7 flex items-center justify-center rounded-full bg-white hover:scale-105 transition-all ${!hasAudio ? 'opacity-50 cursor-not-allowed' : ''}`} 
          onClick={togglePlayPause} 
          disabled={!hasAudio}
        >
          {isPlaying ? 
            <Pause className="w-3.5 h-3.5 text-black" /> : 
            <Play className="w-3.5 h-3.5 text-black ml-0.5" />
          }
        </button>
        
        <button 
          className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" 
          onClick={skipForward}
          disabled={!hasAudio}
        >
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
      
      {track && (
        <div className="w-full flex flex-col gap-1">
          <div className="flex w-full items-center gap-2">
            <span className="text-xs text-zinc-400 w-8 text-right">{formatTime(currentTime)}</span>
            <Slider 
              value={[progress]} 
              max={100} 
              step={0.1}
              onValueChange={handleProgressChange}
              disabled={!hasAudio}
              className="h-1 w-full"
            />
            <span className="text-xs text-zinc-400 w-8">{formatTime(trackDuration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
