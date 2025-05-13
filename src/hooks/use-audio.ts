
import { useState, useEffect, useRef } from 'react';

export function useAudio(audioSrc: string | undefined) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(volume);

  // Initialize audio element
  useEffect(() => {
    if (!audioSrc) return;

    const audioElement = new Audio(audioSrc);
    audioElement.volume = volume;
    
    setAudio(audioElement);
    
    // Clean up audio element on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioSrc]);

  // Set up event listeners for audio element
  useEffect(() => {
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio]);

  // Play/pause control
  useEffect(() => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  // Mute control
  useEffect(() => {
    if (!audio) return;
    
    audio.muted = isMuted;
  }, [isMuted, audio]);

  // Volume control
  useEffect(() => {
    if (!audio) return;
    
    audio.volume = volume;
  }, [volume, audio]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
      setVolume(0);
    }
  };
  
  const seek = (time: number) => {
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
  };
  
  const skipForward = () => {
    if (!audio) return;
    
    const newTime = Math.min(audio.currentTime + 10, duration);
    seek(newTime);
  };
  
  const skipBack = () => {
    if (!audio) return;
    
    const newTime = Math.max(audio.currentTime - 10, 0);
    seek(newTime);
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlayPause,
    toggleMute,
    seek,
    setVolume,
    skipForward,
    skipBack
  };
}
