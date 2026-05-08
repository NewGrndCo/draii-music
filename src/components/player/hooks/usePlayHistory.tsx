
import { useState, useCallback } from 'react';

export const usePlayHistory = () => {
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  
  const updatePlayHistory = useCallback((songId: string) => {
    setPlayHistory(prev => {
      const newHistory = [...prev.filter(id => id !== songId), songId].slice(-5);
      return newHistory;
    });
  }, []);
  
  const getPreviousSongId = useCallback(() => {
    if (playHistory.length > 1) {
      return playHistory[playHistory.length - 2];
    }
    return null;
  }, [playHistory]);
  
  const removePreviousSong = useCallback(() => {
    setPlayHistory(prev => prev.slice(0, -1));
  }, []);
  
  return {
    playHistory,
    updatePlayHistory,
    getPreviousSongId,
    removePreviousSong
  };
};
