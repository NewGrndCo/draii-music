
import { useAudioPlayer } from './audio/useAudioPlayer';
import { usePlayerControls } from './audio/usePlayerControls';
import { useTimeSkipping } from './audio/useTimeSkipping';
import { useTimeFormatter } from './audio/useTimeFormatter';
import { useMemo } from 'react';

export const useAudio = () => {
  const {
    currentSong,
    playerState,
    audioRef,
    setCurrentSong,
    setPlayerState,
    setOnEndCallback
  } = useAudioPlayer();
  
  const {
    toggleRepeat,
    playSong,
    togglePlayPause,
    seekTo,
    setVolume
  } = usePlayerControls(
    currentSong,
    playerState,
    audioRef,
    setCurrentSong,
    setPlayerState
  );
  
  const {
    skipForward,
    skipBackward
  } = useTimeSkipping(currentSong, audioRef, seekTo);
  
  const { formatTime } = useTimeFormatter();
  
  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    currentSong,
    playerState,
    playSong,
    togglePlayPause,
    seekTo,
    setVolume,
    formatTime,
    toggleRepeat,
    skipForward,
    skipBackward,
    setOnEndCallback
  }), [
    currentSong,
    playerState,
    playSong,
    togglePlayPause,
    seekTo,
    setVolume,
    formatTime,
    toggleRepeat,
    skipForward,
    skipBackward,
    setOnEndCallback
  ]);
};
