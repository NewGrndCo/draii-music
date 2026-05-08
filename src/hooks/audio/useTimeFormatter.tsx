
import { useCallback } from 'react';

export const useTimeFormatter = () => {
  // Format time from seconds to MM:SS
  const formatTime = useCallback((timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return { formatTime };
};
