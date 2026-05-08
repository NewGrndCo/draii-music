import { useEffect } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useMusicLibrary } from '../../hooks/useMusicLibrary';
import { getSharedSongId, handleSharedSong } from '../../utils/shareUtils';
import React from 'react';

const SharedSongHandler: React.FC = () => {
  const { playSong } = usePlayer();
  const { albums } = useMusicLibrary();

  const allSongs = React.useMemo(() => {
    return albums?.flatMap(album => album.songs || []) || [];
  }, [albums]);

  useEffect(() => {
    const sharedSongId = getSharedSongId();
    if (sharedSongId && allSongs.length > 0) {
      handleSharedSong(sharedSongId, allSongs, playSong);
    }
  }, [allSongs, playSong]);

  return null;
};

export default SharedSongHandler;
