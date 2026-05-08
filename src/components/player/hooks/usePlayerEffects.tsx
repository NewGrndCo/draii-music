
import { useNetworkStatus } from './useNetworkStatus';
import { useBoostStatus } from './useBoostStatus';
import { useVisualEffects } from './useVisualEffects';
import { useOptimizedEarnings } from '../../../hooks/useOptimizedEarnings';
import { Song } from '../../../data/musicData';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: boolean;
}

export const usePlayerEffects = (
  currentSong: Song | null,
  playerState: PlayerState
) => {
  const { networkUserCount, signalStrength } = useNetworkStatus();
  const isBoosted = useBoostStatus(currentSong);
  const { lightPosition } = useVisualEffects();
  
  // Use optimized earnings hook
  const {
    currentEarnings,
    currentRate,
    totalEarnings,
    initialReserve
  } = useOptimizedEarnings(currentSong, playerState);

  return {
    currentEarnings,
    currentRate,
    networkUserCount,
    signalStrength,
    lightPosition,
    isBoosted,
    totalEarnings,
    initialReserve
  };
};
