
import { useAudioState } from './useAudioState';
import { useAudioEvents } from './useAudioEvents';
import { useAudioElement } from './useAudioElement';

export type { AudioPlayerState } from './useAudioState';

export const useAudioPlayer = () => {
  const {
    currentSong,
    setCurrentSong,
    playerState,
    setPlayerState
  } = useAudioState();

  const eventHandlers = useAudioEvents(playerState, setPlayerState);
  
  const { audioRef } = useAudioElement(
    currentSong,
    playerState,
    setPlayerState,
    eventHandlers
  );

  return {
    currentSong,
    playerState,
    audioRef,
    setCurrentSong,
    setPlayerState,
    setOnEndCallback: eventHandlers.setOnEndCallback
  };
};
