
import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../../data/musicData';
import { cn } from '@/lib/utils';
import PlayerLayoutUI from './layout/PlayerLayoutUI';
import { useDarkMode } from './theme/DarkModeProvider';

interface PlayerLayoutProps {
  children: React.ReactNode;
  horizontalMode: boolean;
  gradientColor: string;
  lightPosition: { x: number; y: number };
  currentSong: Song | null;
  loading: boolean;
  showLibrary: () => void;
}

const PlayerLayout: React.FC<PlayerLayoutProps> = ({
  children,
  horizontalMode,
  gradientColor,
  lightPosition,
  currentSong,
  loading,
  showLibrary
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simpleTheme, setSimpleTheme] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current && playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          });
      }
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <PlayerLayoutUI
      gradientColor={gradientColor}
      lightPosition={lightPosition}
      currentSong={currentSong}
      loading={loading}
      horizontalMode={horizontalMode}
      isFullscreen={isFullscreen}
      simpleTheme={simpleTheme}
      darkMode={darkMode}
      onShowLibrary={showLibrary}
      onToggleFullscreen={toggleFullscreen}
      onToggleDarkMode={toggleDarkMode}
      playerContainerRef={playerContainerRef}
    >
      {children}
    </PlayerLayoutUI>
  );
};

export default PlayerLayout;
