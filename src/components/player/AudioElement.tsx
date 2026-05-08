
import React, { useEffect, useCallback, useMemo } from 'react';
import { Song } from '../../data/musicData';

interface AudioElementProps {
  currentSong: Song | null;
  playerState: {
    isPlaying: boolean;
  };
  skipForward: () => void;
  skipBackward: () => void;
  togglePlayPause: () => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
}

const AudioElement: React.FC<AudioElementProps> = ({
  currentSong,
  playerState,
  skipForward,
  skipBackward,
  togglePlayPause,
  playNextSong,
  playPreviousSong
}) => {
  // Memoize media metadata to prevent recreation
  const mediaMetadata = useMemo(() => {
    if (!currentSong) return null;
    
    return new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album,
      artwork: [
        { src: currentSong.coverArt, sizes: '512x512', type: 'image/jpeg' }
      ]
    });
  }, [currentSong?.id, currentSong?.title, currentSong?.artist, currentSong?.album, currentSong?.coverArt]);

  // Memoize action handlers to prevent recreation
  const handleSeekForward = useCallback(() => skipForward(), [skipForward]);
  const handleSeekBackward = useCallback(() => skipBackward(), [skipBackward]);

  // Set up Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && mediaMetadata) {
      navigator.mediaSession.metadata = mediaMetadata;
      navigator.mediaSession.playbackState = playerState.isPlaying ? 'playing' : 'paused';
      
      // Set action handlers with memoized functions
      navigator.mediaSession.setActionHandler('play', togglePlayPause);
      navigator.mediaSession.setActionHandler('pause', togglePlayPause);
      navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
      navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
      navigator.mediaSession.setActionHandler('seekforward', handleSeekForward);
      navigator.mediaSession.setActionHandler('seekbackward', handleSeekBackward);
    }
  }, [mediaMetadata, playerState.isPlaying, togglePlayPause, playNextSong, playPreviousSong, handleSeekForward, handleSeekBackward]);
  
  // Handle autoplay with optimized event listeners
  useEffect(() => {
    const handleUserGesture = () => {
      const audioElement = document.querySelector('audio');
      if (audioElement && playerState.isPlaying && currentSong) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently handle auto-play prevention
          });
        }
      }
    };
    
    // Use passive listeners for better performance
    document.addEventListener('click', handleUserGesture, { passive: true });
    document.addEventListener('touchstart', handleUserGesture, { passive: true });
    
    return () => {
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
    };
  }, [currentSong?.id, playerState.isPlaying]);

  return null;
};

export default React.memo(AudioElement);
