
import { useCallback } from 'react';
import { toast } from 'sonner';
import { FastForward, Rewind } from 'lucide-react';
import { Song } from '../../data/musicData';
import { useIsMobile } from '../use-mobile';

export const useTimeSkipping = (
  currentSong: Song | null,
  audioRef: React.RefObject<HTMLAudioElement>,
  seekTo: (time: number) => void
) => {
  const isMobile = useIsMobile();
  const toastDuration = isMobile ? 1000 : 2000; // Shorter toast on mobile
  
  // Skip forward seconds
  const skipForward = useCallback((seconds = 10) => {
    if (audioRef.current && currentSong) {
      const newTime = Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration);
      seekTo(newTime);
      
      // More compact toast for mobile
      toast(`+${seconds}s`, {
        icon: <FastForward size={16} />,
        duration: toastDuration,
        className: "compact-toast"
      });
    }
  }, [audioRef, currentSong, seekTo, toastDuration]);
  
  // Skip backward seconds
  const skipBackward = useCallback((seconds = 10) => {
    if (audioRef.current && currentSong) {
      const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
      seekTo(newTime);
      
      // More compact toast for mobile
      toast(`-${seconds}s`, {
        icon: <Rewind size={16} />,
        duration: toastDuration,
        className: "compact-toast"
      });
    }
  }, [audioRef, currentSong, seekTo, toastDuration]);

  return {
    skipForward,
    skipBackward
  };
};
