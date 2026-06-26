import React from 'react';
import { Album, Song } from '../data/musicData';
import AppleStyleLibrary from './library/AppleStyleLibrary';
import LoadingState from './library/LoadingState';

interface MusicLibraryProps {
  albums: Album[];
  onSelectSong: (song: Song) => void;
  onClose: () => void;
  isVisible: boolean;
  isLoading?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  initialAlbumSlug?: string | null;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({
  albums = [],
  onSelectSong,
  onClose,
  isVisible,
  isLoading = false,
  initialAlbumSlug,
}) => {
  if (!isVisible) return null;
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }
  return (
    <AppleStyleLibrary
      albums={albums}
      onSelectSong={onSelectSong}
      onClose={onClose}
      isVisible={isVisible}
      initialAlbumSlug={initialAlbumSlug}
    />
  );
};

export default MusicLibrary;
