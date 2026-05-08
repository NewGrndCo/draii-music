import React, { createContext, useContext, useCallback } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { usePlaybackHandlers } from '../components/player/hooks/usePlaybackHandlers';
import { usePlayerEffects } from '../components/player/hooks/usePlayerEffects';
import { Song } from '../data/musicData';
import { AudioPlayerState } from '../hooks/audio/useAudioState';

interface PlayerContextValue {
  currentSong: Song | null;
  playerState: AudioPlayerState;
  albums: any[];
  loading: boolean;

  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  formatTime: (time: number) => string;
  setOnEndCallback: (callback: () => void) => void;

  nextSongs: Song[];
  liked: boolean;
  horizontalMode: boolean;
  playCount: number;
  likesCount: number;
  gradientColor: string;
  showLibrary: boolean;
  heartAnimation: boolean;
  playNextSong: () => void;
  playPreviousSong: () => void;
  toggleLike: () => void;
  handleSelectSong: (song: Song) => void;
  toggleLayout: () => void;
  openLibrary: (showAllCovers: boolean) => void;
  closeLibrary: () => void;
  handleVolumeChange: (values: number[]) => void;

  lightPosition: { x: number; y: number };
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const usePlayer = (): PlayerContextValue => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentSong, playerState, playSong, togglePlayPause,
    seekTo, setVolume, formatTime, toggleRepeat,
    skipForward, skipBackward, setOnEndCallback
  } = useAudio();

  const { albums, loading } = useMusicLibrary();

  const playbackHandlers = usePlaybackHandlers(
    currentSong, albums, playSong, seekTo, skipForward, skipBackward
  );

  const playerEffects = usePlayerEffects();

  const handleVolumeChange = useCallback((value: number[]) => {
    if (value.length > 0) setVolume(value[0]);
  }, [setVolume]);

  const value: PlayerContextValue = {
    currentSong, playerState, albums, loading,
    playSong, togglePlayPause, seekTo, setVolume,
    toggleRepeat, skipForward, skipBackward, formatTime, setOnEndCallback,
    ...playbackHandlers,
    handleVolumeChange,
    ...playerEffects,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
