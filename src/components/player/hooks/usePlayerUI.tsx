import { useState, useCallback } from 'react';

export const usePlayerUI = () => {
  const [horizontalMode, setHorizontalMode] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [showAllCovers, setShowAllCovers] = useState<boolean>(false);

  const toggleLayout = useCallback(() => {
    setHorizontalMode(prev => !prev);
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
    showLibrary,
    showAllCovers,
    toggleLayout,
    openLibrary,
    closeLibrary,
  };
};
