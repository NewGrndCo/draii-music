import { useState, useCallback } from 'react';

export const usePlayerUI = () => {
  const [horizontalMode, setHorizontalMode] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [showAllCovers, setShowAllCovers] = useState<boolean>(false);
  const [libraryAlbumSlug, setLibraryAlbumSlug] = useState<string | null>(null);

  const toggleLayout = useCallback(() => {
    setHorizontalMode(prev => !prev);
  }, []);

  const openLibrary = useCallback((showCovers = false, albumSlug?: string) => {
    setShowLibrary(true);
    setShowAllCovers(showCovers);
    setLibraryAlbumSlug(albumSlug ?? null);
  }, []);

  const closeLibrary = useCallback(() => {
    setShowLibrary(false);
  }, []);

  return {
    horizontalMode,
    showLibrary,
    showAllCovers,
    libraryAlbumSlug,
    toggleLayout,
    openLibrary,
    closeLibrary,
  };
};
