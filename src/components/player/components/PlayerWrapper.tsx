import React from 'react';
import PlayerSwipeGestures from '../gestures/PlayerSwipeGestures';
import ShineEffect from '../effects/ShineEffect';
import PlayerBackground from '../visuals/PlayerBackground';
import PlayerLayout from '../PlayerLayout';
import { Song } from '../../../data/musicData';
import { useDarkMode } from '../theme/DarkModeProvider';

interface PlayerWrapperProps {
  currentSong: Song | null;
  loading: boolean;
  horizontalMode: boolean;
  gradientColor: string;
  lightPosition: { x: number; y: number };
  children: React.ReactNode;
  playNextSong: () => void;
  playPreviousSong: () => void;
  openLibrary: (showAllCovers: boolean) => void;
}

const PlayerWrapper: React.FC<PlayerWrapperProps> = ({
  currentSong,
  loading,
  horizontalMode,
  gradientColor,
  lightPosition,
  children,
  playNextSong,
  playPreviousSong,
  openLibrary,
}) => {
  const { darkMode } = useDarkMode();

  const openLibraryWithCovers = () => openLibrary(horizontalMode);

  return (
    <PlayerSwipeGestures
      playNextSong={playNextSong}
      playPreviousSong={playPreviousSong}
      openLibrary={openLibraryWithCovers}
    >
      <PlayerBackground
        horizontalMode={horizontalMode}
        gradientColor={gradientColor}
        darkMode={darkMode}
      >
        <ShineEffect lightPosition={lightPosition}>
          <PlayerLayout
            horizontalMode={horizontalMode}
            gradientColor={gradientColor}
            lightPosition={lightPosition}
            currentSong={currentSong}
            loading={loading}
            showLibrary={openLibraryWithCovers}
          >
            {children}
          </PlayerLayout>
        </ShineEffect>
      </PlayerBackground>
    </PlayerSwipeGestures>
  );
};

export default PlayerWrapper;
