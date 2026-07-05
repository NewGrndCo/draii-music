import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';

const MusicLibrary = lazy(() => import('../MusicLibrary'));

const DialogsContainer: React.FC = () => {
  const { albums, loading, showLibrary, closeLibrary, handleSelectSong, openLibrary } = usePlayer();
  const [sharedAlbumSlug, setSharedAlbumSlug] = useState<string | null>(null);
  const handledRef = useRef(false);
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  // Detect shared album via path segment (/:slug) or legacy ?a=<slug> query.
  useEffect(() => {
    if (handledRef.current || loading || !albums.length) return;
    const params = new URLSearchParams(window.location.search);
    const key = slug || params.get('a');
    if (!key) return;
    const match = albums.find((a) => a.slug === key || a.id === key);
    if (!match) return;
    handledRef.current = true;
    setSharedAlbumSlug(key);
    openLibrary(true);
    if (match.songs?.[0]) handleSelectSong(match.songs[0]);
    // Clean the URL back to root without a full navigation.
    if (params.get('a')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('a');
      window.history.replaceState({}, '', url);
    }
    if (slug) navigate('/', { replace: true });
  }, [albums, loading, openLibrary, handleSelectSong, slug, navigate]);

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
