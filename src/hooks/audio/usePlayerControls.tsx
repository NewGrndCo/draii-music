
import { useCallback } from 'react';
import { Song } from '../../data/musicData';
import { toast } from 'sonner';
import { AudioPlayerState } from './useAudioPlayer';

export const usePlayerControls = (
  currentSong: Song | null,
  playerState: AudioPlayerState,
  audioRef: React.RefObject<HTMLAudioElement>,
  setCurrentSong: (song: Song) => void,
  setPlayerState: (stateFn: (prev: AudioPlayerState) => AudioPlayerState) => void
) => {
  const toggleRepeat = useCallback(() => {
    setPlayerState(prev => {
      const newRepeat = !prev.repeat;
      if (audioRef.current) {
        audioRef.current.loop = newRepeat;
      }
      toast.info(newRepeat ? 'Repeat turned on' : 'Repeat turned off', {
        duration: 2000
      });
      return { ...prev, repeat: newRepeat };
    });
  }, [audioRef, setPlayerState]);
  
  const playSong = useCallback((song: Song) => {
    const canStartPlayback = navigator.userActivation?.hasBeenActive ?? true;
    setCurrentSong(song);
    setPlayerState(prev => ({
      ...prev,
      isPlaying: canStartPlayback,
      isReady: false // Reset ready state when starting new song
    }));
  }, [setCurrentSong, setPlayerState]);
  
  const togglePlayPause = useCallback(() => {
    if (!currentSong) return;

    setPlayerState(prev => {
      const newIsPlaying = !prev.isPlaying;
      
      // Update media session playback state
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = newIsPlaying ? 'playing' : 'paused';
      }
      
      return {
        ...prev,
        isPlaying: newIsPlaying
      };
    });
  }, [currentSong, setPlayerState, playerState.isPlaying, playerState.isReady]);
  
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prev => ({
        ...prev,
        currentTime: time
      }));
    }
  }, [audioRef, setPlayerState]);
  
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = newVolume;
      setPlayerState(prev => ({
        ...prev,
        volume: newVolume
      }));
    }
  }, [audioRef, setPlayerState]);

  return {
    toggleRepeat,
    playSong,
    togglePlayPause,
    seekTo,
    setVolume
  };
};
