import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { usePlaybackHandlers } from '../components/player/hooks/usePlaybackHandlers';
import { usePlayerEffects } from '../components/player/hooks/usePlayerEffects';
import { usePaymentInfo } from '../components/player/hooks/usePaymentInfo';
import { commitSessionEarnings } from '../utils/earningsUtil';
import { Song } from '../data/musicData';
import { AudioPlayerState } from '../hooks/audio/useAudioState';

interface PlayerContextValue {
  // Core audio
  currentSong: Song | null;
  playerState: AudioPlayerState;
  albums: any[];
  loading: boolean;

  // Audio controls
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  formatTime: (time: number) => string;
  setOnEndCallback: (callback: () => void) => void;

  // Playback handlers
  nextSongs: Song[];
  liked: boolean;
  horizontalMode: boolean;
  playCount: number;
  likesCount: number;
  gradientColor: string;
  totalEarnings: number;
  showEarnings: boolean;
  showLibrary: boolean;
  heartAnimation: boolean;
  playNextSong: () => void;
  playPreviousSong: () => void;
  toggleLike: () => void;
  handleSelectSong: (song: Song) => void;
  toggleLayout: () => void;
  toggleEarnings: () => void;
  hideEarnings: () => void;
  openLibrary: (showAllCovers: boolean) => void;
  closeLibrary: () => void;
  handleVolumeChange: (values: number[]) => void;

  // Player effects
  currentEarnings: number;
  currentRate: number;
  networkUserCount: number;
  signalStrength: number;
  lightPosition: { x: number; y: number };
  isBoosted: boolean;
  initialReserve: number;

  // Payment/dialog state
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  paymentType: 'cashapp' | 'paypal';
  setPaymentType: (type: 'cashapp' | 'paypal') => void;
  paymentValue: string;
  setPaymentValue: (value: string) => void;
  showMiningDialog: boolean;
  setShowMiningDialog: (show: boolean) => void;
  showFullTerms: boolean;
  setShowFullTerms: (show: boolean) => void;
  savePaymentInfo: () => void;
  toggleMiningInfo: () => void;
  openTermsOfService: () => void;
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

  const playerEffects = usePlayerEffects(currentSong, playerState);
  const paymentInfo = usePaymentInfo();

  const handleVolumeChange = useCallback((value: number[]) => {
    if (value.length > 0) {
      setVolume(value[0]);
    }
  }, [setVolume]);

  // Commit earnings on song end and unmount
  useEffect(() => {
    setOnEndCallback(() => {
      commitSessionEarnings();
      // Force refresh totalEarnings from localStorage after commit
      if (playerEffects && 'totalEarnings' in playerEffects) {
        // The useOptimizedEarnings hook handles state sync on song change
      }
    });
    return () => { commitSessionEarnings(); };
  }, [setOnEndCallback]);

  const value: PlayerContextValue = {
    currentSong, playerState, albums, loading,
    playSong, togglePlayPause, seekTo, setVolume,
    toggleRepeat, skipForward, skipBackward, formatTime, setOnEndCallback,
    ...playbackHandlers,
    handleVolumeChange,
    ...playerEffects,
    ...paymentInfo,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
