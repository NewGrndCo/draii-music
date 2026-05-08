
import { useState, useCallback } from 'react';
import { getTotalEarnings } from '../../../utils/earningsUtil';

export const usePlayerUI = () => {
  const [horizontalMode, setHorizontalMode] = useState<boolean>(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(getTotalEarnings());
  const [showEarnings, setShowEarnings] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [showAllCovers, setShowAllCovers] = useState<boolean>(false);
  
  // Toggle layout between horizontal and vertical
  const toggleLayout = useCallback(() => {
    setHorizontalMode(prev => !prev);
  }, []);
  
  // Toggle earnings display
  const toggleEarnings = useCallback(() => {
    setShowEarnings(prev => !prev);
  }, []);
  
  const hideEarnings = useCallback(() => {
    setShowEarnings(false);
  }, []);
  
  const openLibrary = useCallback((showCovers = false) => {
    setShowLibrary(true);
    setShowAllCovers(showCovers);
  }, []);
  
  const closeLibrary = useCallback(() => {
    setShowLibrary(false);
  }, []);
  
  return {
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
  };
};
