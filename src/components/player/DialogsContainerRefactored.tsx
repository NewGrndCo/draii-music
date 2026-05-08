import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import MusicLibrary from '../MusicLibrary';

const DialogsContainer: React.FC = () => {
  const { albums, loading, showLibrary, closeLibrary, handleSelectSong } = usePlayer();

  return (
    <MusicLibrary
      albums={albums}
      onSelectSong={handleSelectSong}
      onClose={closeLibrary}
      isVisible={showLibrary}
      isLoading={loading}
      darkMode={false}
      onToggleDarkMode={() => {}}
    />
  );
};

export default React.memo(DialogsContainer);
