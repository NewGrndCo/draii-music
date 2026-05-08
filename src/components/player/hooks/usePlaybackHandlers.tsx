
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
  // Use smaller, focused hooks
  const { playHistory, updatePlayHistory, getPreviousSongId, removePreviousSong } = usePlayHistory();
  const { nextSongs } = useNextSongs(currentSong, albums, playHistory);
  const { playCount, likesCount, liked, heartAnimation, toggleLike } = useSongStats(currentSong);
  const { gradientColor, updateGradientColor } = useGradientColor();
  const {
    horizontalMode,
    totalEarnings,
    showEarnings,
    showLibrary,
    showAllCovers,
    toggleLayout,
    toggleEarnings,
    hideEarnings,
    openLibrary,
    closeLibrary,
    setTotalEarnings
  } = usePlayerUI();
  
  // Memoize current song ID to prevent unnecessary updates
  const currentSongId = currentSong?.id;
  const currentSongCoverArt = currentSong?.coverArt;
  
  // Update gradient color and play history when current song changes
  useEffect(() => {
    if (currentSong && currentSongCoverArt) {
      // Extract dominant color from cover art
      updateGradientColor(currentSongCoverArt);
      
      // Update play history with current song
      updatePlayHistory(currentSong.id);
    }
  }, [currentSongId, currentSongCoverArt, updateGradientColor, updatePlayHistory]);
  
  // Memoize all songs to prevent recalculation on every render
  const allSongs = useMemo(() => {
    return albums.flatMap(album => album.songs);
  }, [albums]);
  
  // Updated playNextSong to use the nextSongs array from Next Up section
  const playNextSong = useCallback(() => {
    if (nextSongs.length > 0) {
      // Use the first song from the Next Up list
      console.log('Playing next song from Next Up list:', nextSongs[0].title);
      playSong(nextSongs[0]);
    } else {
      // Fallback: play random song if Next Up is empty
      if (allSongs.length > 0) {
        const availableSongs = allSongs.filter(song => 
          !currentSong || song.id !== currentSong.id
        );
        if (availableSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableSongs.length);
          console.log('Next Up empty, playing random song:', availableSongs[randomIndex].title);
          playSong(availableSongs[randomIndex]);
        }
      }
    }
  }, [nextSongs, playSong, allSongs, currentSong]);
  
  const playPreviousSong = useCallback(() => {
    // If we have play history, go to previous song
    const previousSongId = getPreviousSongId();
    if (previousSongId) {
      const previousSong = allSongs.find(song => song.id === previousSongId);
      
      if (previousSong) {
        // Remove the current song from history
        removePreviousSong();
        console.log('Playing previous song from history:', previousSong.title);
        playSong(previousSong);
        return;
      }
    }
    
    // Fallback: just reset to beginning of current song
    seekTo(0);
  }, [getPreviousSongId, allSongs, playSong, seekTo, removePreviousSong]);
  
  const handleSelectSong = useCallback((song: Song) => {
    playSong(song);
    closeLibrary();
  }, [playSong, closeLibrary]);
  
  const handleVolumeChange = useCallback((value: number[]) => {
    // This is just a pass-through function, will be connected in the main component
    return value;
  }, []);
  
  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    nextSongs,
    liked,
    horizontalMode,
    playCount,
    likesCount,
    gradientColor,
    totalEarnings,
    showEarnings,
    showLibrary,
    showAllCovers,
    heartAnimation,
    playNextSong,
    playPreviousSong,
    toggleLike,
    handleSelectSong,
    toggleLayout,
    toggleEarnings,
    hideEarnings,
    openLibrary,
    closeLibrary,
    handleVolumeChange,
    setTotalEarnings
  }), [
    nextSongs,
    liked,
    horizontalMode,
    playCount,
    likesCount,
    gradientColor,
    totalEarnings,
    showEarnings,
    showLibrary,
    showAllCovers,
    heartAnimation,
    playNextSong,
    playPreviousSong,
    toggleLike,
    handleSelectSong,
    toggleLayout,
    toggleEarnings,
    hideEarnings,
    openLibrary,
    closeLibrary,
    handleVolumeChange,
    setTotalEarnings
  ]);
};
