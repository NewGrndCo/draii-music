import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  recentSongs: Song[];
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

  // Analytics: track listen on song change, increment play count on song end
  const lastTrackedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentSong || lastTrackedRef.current === currentSong.id) return;
    lastTrackedRef.current = currentSong.id;
    const source = document.referrer ? new URL(document.referrer).hostname : 'direct';
    let geo: any = {};
    try { const c = sessionStorage.getItem('live-presence-geo-v1'); if (c) geo = JSON.parse(c); } catch {}
    supabase.functions.invoke('track-listen', {
      body: { songId: currentSong.id, source, country: geo.country, region: geo.region, city: geo.city },
    }).catch(() => {});
  }, [currentSong]);

  useEffect(() => {
    setOnEndCallback(() => {
      const id = currentSong?.id;
      if (id) supabase.functions.invoke('increment-play-count', { body: { songId: id } }).catch(() => {});
    });
  }, [currentSong, setOnEndCallback]);

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
