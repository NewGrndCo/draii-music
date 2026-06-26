import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

const MusicLibrary = lazy(() => import('../MusicLibrary'));

const DialogsContainer: React.FC = () => {
  const { albums, loading, showLibrary, closeLibrary, handleSelectSong, openLibrary } = usePlayer();
  const [sharedAlbumSlug, setSharedAlbumSlug] = useState<string | null>(null);
  const handledRef = useRef(false);

  // Detect ?a=<slug> shared album links once albums are loaded.
  useEffect(() => {
    if (handledRef.current || loading || !albums.length) return;
    const params = new URLSearchParams(window.location.search);
    const key = params.get('a');
    if (!key) return;
    const match = albums.find((a) => a.slug === key || a.id === key);
    if (!match) return;
    handledRef.current = true;
    setSharedAlbumSlug(key);
    openLibrary(true);
    // Auto-queue the first track so playback starts immediately.
    if (match.songs?.[0]) handleSelectSong(match.songs[0]);
    // Clean the URL.
    const url = new URL(window.location.href);
    url.searchParams.delete('a');
    window.history.replaceState({}, '', url);
  }, [albums, loading, openLibrary, handleSelectSong]);

  if (!showLibrary) return <></>;

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
        initialAlbumSlug={sharedAlbumSlug}
      />
    </Suspense>
  );
};

export default React.memo(DialogsContainer);
