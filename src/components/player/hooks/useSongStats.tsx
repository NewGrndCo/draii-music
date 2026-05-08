
import { useState, useEffect, useCallback } from 'react';
import { Song } from '../../../data/musicData';

export const useSongStats = (currentSong: Song | null) => {
  const [playCount, setPlayCount] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [heartAnimation, setHeartAnimation] = useState(false);
  
  // Update stats when current song changes
  useEffect(() => {
    if (currentSong) {
      // Use song-specific stats if available, otherwise generate random ones
      setPlayCount(currentSong.playCount || Math.floor(Math.random() * 1000) + 50);
      setLikesCount(currentSong.likesCount || Math.floor(Math.random() * 200) + 10);
      setLiked(false); // Reset liked state for new song
    }
  }, [currentSong]);
  
  const toggleLike = useCallback(() => {
    setLiked(prev => !prev);
    
    setLikesCount(prev => !liked ? prev + 1 : prev - 1);
    
    if (!liked) {
      // Heart animation
      setHeartAnimation(true);
      setTimeout(() => setHeartAnimation(false), 1000);
      // No deduction from total earnings anymore!
    }
  }, [liked]);
  
  return {
    playCount,
    likesCount,
    liked,
    heartAnimation,
    toggleLike
  };
};
