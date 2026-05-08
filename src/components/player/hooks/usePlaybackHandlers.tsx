import { useEffect, useCallback, useMemo } from 'react';
import { Song } from '../../../data/musicData';
import { useNextSongs } from './useNextSongs';
import { useSongStats } from './useSongStats';
import { useGradientColor } from './useGradientColor';
import { usePlayHistory } from './usePlayHistory';
import { usePlayerUI } from './usePlayerUI';

export const usePlaybackHandlers = (
  currentSong: Song | null,
  albums: any[],
  playSong: (song: Song) => void,
  seekTo: (time: number) => void,
  skipForward: () => void,
  skipBackward: () => void
) => {
  const { playHistory, updatePlayHistory, getPreviousSongId, removePreviousSong } = usePlayHistory();
  const { nextSongs } = useNextSongs(currentSong, albums, playHistory);
  const { playCount, likesCount, liked, heartAnimation, toggleLike } = useSongStats(currentSong);
  const { gradientColor, updateGradientColor } = useGradientColor();
  const {
    horizontalMode,
    showLibrary,
    showAllCovers,
    toggleLayout,
    openLibrary,
    closeLibrary,
  } = usePlayerUI();

  const currentSongId = currentSong?.id;
  const currentSongCoverArt = currentSong?.coverArt;

  useEffect(() => {
    if (currentSong && currentSongCoverArt) {
      updateGradientColor(currentSongCoverArt);
      updatePlayHistory(currentSong.id);
    }
  }, [currentSongId, currentSongCoverArt, updateGradientColor, updatePlayHistory]);

  const allSongs = useMemo(() => albums.flatMap(album => album.songs), [albums]);

  const playNextSong = useCallback(() => {
    if (nextSongs.length > 0) {
      playSong(nextSongs[0]);
    } else if (allSongs.length > 0) {
      const availableSongs = allSongs.filter(song => !currentSong || song.id !== currentSong.id);
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        playSong(availableSongs[randomIndex]);
      }
    }
  }, [nextSongs, playSong, allSongs, currentSong]);

  const playPreviousSong = useCallback(() => {
    const previousSongId = getPreviousSongId();
    if (previousSongId) {
      const previousSong = allSongs.find(song => song.id === previousSongId);
      if (previousSong) {
        removePreviousSong();
        playSong(previousSong);
        return;
      }
    }
    seekTo(0);
  }, [getPreviousSongId, allSongs, playSong, seekTo, removePreviousSong]);

  const handleSelectSong = useCallback((song: Song) => {
    playSong(song);
    closeLibrary();
  }, [playSong, closeLibrary]);

  const handleVolumeChange = useCallback((value: number[]) => value, []);

  return useMemo(() => ({
    nextSongs,
    liked,
    horizontalMode,
    playCount,
    likesCount,
    gradientColor,
    showLibrary,
    showAllCovers,
    heartAnimation,
    playNextSong,
    playPreviousSong,
    toggleLike,
    handleSelectSong,
    toggleLayout,
    openLibrary,
    closeLibrary,
    handleVolumeChange,
  }), [
    nextSongs, liked, horizontalMode, playCount, likesCount, gradientColor,
    showLibrary, showAllCovers, heartAnimation, playNextSong, playPreviousSong,
    toggleLike, handleSelectSong, toggleLayout, openLibrary, closeLibrary, handleVolumeChange,
  ]);
};
