
import { useState } from 'react';
import { Song } from '../../data/musicData';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
  isReady: boolean;
}

export const useAudioState = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1.0,
    repeat: false,
    isReady: false,
  });

  return {
    currentSong,
    setCurrentSong,
    playerState,
    setPlayerState
  };
};
