import { useState, useEffect, useCallback } from 'react';
import { Song } from '../../../data/musicData';

const PLAYS_KEY = 'songPlayDeltas';
const LIKES_KEY = 'songLikeDeltas';
const LIKED_KEY = 'songLikedSet';

const readMap = (key: string): Record<string, number> => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeMap = (key: string, map: Record<string, number>) => {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

const readLikedSet = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeLikedSet = (set: Record<string, boolean>) => {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(set));
  } catch {
    /* ignore */
  }
};

export const useSongStats = (currentSong: Song | null) => {
  const [playCount, setPlayCount] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [heartAnimation, setHeartAnimation] = useState(false);

  useEffect(() => {
    if (!currentSong) return;

    // Increment persistent play count for this song
    const plays = readMap(PLAYS_KEY);
    plays[currentSong.id] = (plays[currentSong.id] || 0) + 1;
    writeMap(PLAYS_KEY, plays);

    const likeDeltas = readMap(LIKES_KEY);
    const likedSet = readLikedSet();

    const basePlays = currentSong.playCount || 0;
    const baseLikes = currentSong.likesCount || 0;

    setPlayCount(basePlays + plays[currentSong.id]);
    setLikesCount(baseLikes + (likeDeltas[currentSong.id] || 0));
    setLiked(!!likedSet[currentSong.id]);
  }, [currentSong]);

  const toggleLike = useCallback(() => {
    if (!currentSong) return;
    const songId = currentSong.id;

    const likeDeltas = readMap(LIKES_KEY);
    const likedSet = readLikedSet();
    const wasLiked = !!likedSet[songId];

    if (wasLiked) {
      likeDeltas[songId] = (likeDeltas[songId] || 0) - 1;
      delete likedSet[songId];
    } else {
      likeDeltas[songId] = (likeDeltas[songId] || 0) + 1;
      likedSet[songId] = true;
      setHeartAnimation(true);
      setTimeout(() => setHeartAnimation(false), 1000);
    }

    writeMap(LIKES_KEY, likeDeltas);
    writeLikedSet(likedSet);

    setLiked(!wasLiked);
    setLikesCount(prev => prev + (wasLiked ? -1 : 1));
  }, [currentSong]);

  return {
    playCount,
    likesCount,
    liked,
    heartAnimation,
    toggleLike,
  };
};
