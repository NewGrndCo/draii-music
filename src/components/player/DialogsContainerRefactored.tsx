import React, { lazy, Suspense } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

const MusicLibrary = lazy(() => import('../MusicLibrary'));

const DialogsContainer: React.FC = () => {
  const { albums, loading, showLibrary, closeLibrary, handleSelectSong } = usePlayer();

  if (!showLibrary) return null;

  return (
    <Suspense fallback={null}>
      <MusicLibrary
        albums={albums}
        onSelectSong={handleSelectSong}
        onClose={closeLibrary}
        isVisible={showLibrary}
        isLoading={loading}
        darkMode={false}
        onToggleDarkMode={() => {}}
      />
    </Suspense>
  );
};

export default React.memo(DialogsContainer);
