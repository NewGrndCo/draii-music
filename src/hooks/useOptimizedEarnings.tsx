
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Song } from '../data/musicData';
import { 
  calculateEarnings,
  updateEarningRate,
  getSessionTotal,
  commitSessionEarnings,
  getUserEarnings,
  INITIAL_RESERVE_POOL
} from '../utils/earningsUtil';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
}

export const useOptimizedEarnings = (
  currentSong: Song | null,
  playerState: PlayerState
) => {
  const [currentEarnings, setCurrentEarnings] = useState<number>(() => getSessionTotal());
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(() => getUserEarnings());
  
  const earningsIntervalRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const prevSongRef = useRef<Song | null>(null);
  const rafRef = useRef<number | null>(null);
  const isPlaying = playerState.isPlaying;
  const currentSongId = currentSong?.id;

  // Optimized earnings state update with batching
  const updateEarningsState = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const sessionTotal = getSessionTotal();
      setCurrentEarnings(prev => {
        // Only update if there's a meaningful difference
        return Math.abs(prev - sessionTotal) > 0.001 ? sessionTotal : prev;
      });
    });
  }, []);

  // Memoize static values
  const memoizedValues = useMemo(() => ({
    initialReserve: INITIAL_RESERVE_POOL
  }), []);

  // Real-time earnings updates every 2 seconds so UI reflects the rate
  useEffect(() => {
    if (earningsIntervalRef.current !== null) {
      clearInterval(earningsIntervalRef.current);
      earningsIntervalRef.current = null;
    }
    
    if (isPlaying && currentSong) {
      const initialRate = updateEarningRate();
      setCurrentRate(initialRate);
      lastUpdateRef.current = Date.now();
      
      // Calculate initial tick immediately
      calculateEarnings(0.1);
      updateEarningsState();
      
      const updateInterval = window.setInterval(() => {
        const newRate = updateEarningRate();
        setCurrentRate(newRate);
        
        const now = Date.now();
        const timeElapsed = (now - lastUpdateRef.current) / 1000;
        
        if (timeElapsed >= 0.5) {
          calculateEarnings(timeElapsed);
          updateEarningsState();
          lastUpdateRef.current = now;
        }
      }, 2000);
      
      earningsIntervalRef.current = updateInterval;
    }
    
    return () => {
      if (earningsIntervalRef.current !== null) {
        clearInterval(earningsIntervalRef.current);
        earningsIntervalRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, currentSongId, updateEarningsState]);
  
  // Optimized song change handling
  useEffect(() => {
    if (!currentSong) return;
    
    if (prevSongRef.current && prevSongRef.current.id !== currentSong.id) {
      // Commit session earnings to network total immediately on song change
      const newTotal = commitSessionEarnings();
      setTotalEarnings(newTotal);
      setCurrentEarnings(0);
    }
    
    prevSongRef.current = currentSong;
  }, [currentSongId]);

  return {
    currentEarnings,
    currentRate,
    totalEarnings,
    initialReserve: memoizedValues.initialReserve,
    setTotalEarnings
  };
};
