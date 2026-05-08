
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { AudioPlayerState } from './useAudioState';

export const useAudioEvents = (
  playerState: AudioPlayerState,
  setPlayerState: (stateFn: (prev: AudioPlayerState) => AudioPlayerState) => void
) => {
  const onEndCallback = useRef<() => void>(() => {});
  const hasPlayedSuccessfully = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    return (audioElement: HTMLAudioElement) => {
      const currentTime = audioElement.currentTime;
      setPlayerState(prev => 
        prev.currentTime !== currentTime 
          ? { ...prev, currentTime }
          : prev
      );
    };
  }, [setPlayerState]);

  const updateDuration = useCallback(() => {
    return (audioElement: HTMLAudioElement) => {
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        const duration = audioElement.duration;
        setPlayerState(prev => ({
          ...prev,
          duration,
          isReady: true
        }));
        
        if (loadingTimeoutRef.current) {
          window.clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        console.log('Audio ready - duration loaded:', duration);
      }
    };
  }, [setPlayerState]);

  const handleSongEnd = useCallback(() => {
    if (playerState.repeat) return;
    
    setPlayerState(prev => ({
      ...prev,
      currentTime: 0,
      isPlaying: false
    }));
    
    onEndCallback.current();
  }, [playerState.repeat, setPlayerState]);

  const handlePlaying = useCallback(() => {
    hasPlayedSuccessfully.current = true;
    console.log('Audio playing - setting ready state');
    
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setPlayerState(prev => ({ ...prev, isReady: true }));
  }, [setPlayerState]);

  const handleCanPlay = useCallback(() => {
    console.log('Audio can play - setting ready state');
    setPlayerState(prev => ({ ...prev, isReady: true }));
    
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [setPlayerState]);

  const handleLoadStart = useCallback(() => {
    console.log('Audio load started - setting loading state');
    setPlayerState(prev => ({ ...prev, isReady: false }));
    
    // Set a timeout to force ready state after 3 seconds
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = window.setTimeout(() => {
      console.log('Audio loading timeout - forcing ready state');
      setPlayerState(prev => ({ ...prev, isReady: true }));
      loadingTimeoutRef.current = null;
    }, 3000);
  }, [setPlayerState]);

  const handleError = useCallback((e: Event) => {
    console.error('Audio error:', e);
    if (hasPlayedSuccessfully.current) {
      toast.error('Playback issue', {
        description: 'Try another song',
        duration: 1500
      });
    }
    setPlayerState(prev => ({ ...prev, isReady: true, isPlaying: false }));
    
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [setPlayerState]);

  const setOnEndCallback = useCallback((callback: () => void) => {
    onEndCallback.current = callback;
  }, []);

  return {
    updateProgress,
    updateDuration,
    handleSongEnd,
    handlePlaying,
    handleCanPlay,
    handleLoadStart,
    handleError,
    setOnEndCallback,
    loadingTimeoutRef,
    hasPlayedSuccessfully
  };
};
