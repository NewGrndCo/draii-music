import React from 'react';
import { cn } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';
import SocialLinks from '../SocialLinks';
import PlayerGlowEffects from '../PlayerGlowEffects';
import AlbumCoverDisplay from '../AlbumCoverDisplay';
import type { Song } from '@/data/musicData';
interface PlayerLayoutUIProps {
  gradientColor: string;
  lightPosition: {
    x: number;
    y: number;
  };
  currentSong: Song | null;
  loading: boolean;
  horizontalMode: boolean;
  isFullscreen: boolean;
  simpleTheme: boolean;
  darkMode?: boolean;
  onShowLibrary: () => void;
  onToggleFullscreen: () => void;
  onToggleDarkMode: () => void;
  playerContainerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}
const PlayerLayoutUI: React.FC<PlayerLayoutUIProps> = ({
  gradientColor,
  lightPosition,
  currentSong,
  loading,
  horizontalMode,
  isFullscreen,
  simpleTheme,
  darkMode = false,
  onShowLibrary,
  onToggleFullscreen,
  onToggleDarkMode,
  playerContainerRef,
  children
}) => {
  return <div className="flex flex-col w-full min-h-full items-center justify-center relative z-20 py-6 sm:py-10">
      {/* Only render SocialLinks outside player in non-fullscreen mode */}
      {!isFullscreen && <SocialLinks />}
      
      <div ref={playerContainerRef} className={cn("player-container backdrop-blur-sm transition-all duration-300 static-scale relative overflow-hidden bg-black/35 border border-white/10 shadow-2xl shadow-black/40 w-full mx-auto rounded-2xl", horizontalMode ? "max-w-3xl flex flex-col sm:flex-row music-library-fullscreen" : "max-w-[27rem]")}>
        {/* Dark mode toggle using logo/album art */}
        <button type="button" onClick={onToggleDarkMode} aria-label={darkMode ? "Use light player theme" : "Use dark player theme"} className="absolute top-3 left-3 z-10 rounded-full opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-opacity">
          <span className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white">
            {darkMode ? "☀️" : "🌙"}
          </span>
        </button>
        
        {/* Fullscreen button for horizontal mode */}
        {horizontalMode && <button type="button" onClick={onToggleFullscreen} className="absolute top-3 right-3 z-10 rounded-full p-2.5 transition-colors bg-black/60 hover:bg-black/80 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            <Maximize2 size={16} />
          </button>}
        
        {/* Glow Effects */}
        <PlayerGlowEffects gradientColor={gradientColor} lightPosition={lightPosition} />
        
        {/* Album Art - NO click/hover features */}
        <AlbumCoverDisplay currentSong={currentSong} loading={loading} horizontalMode={horizontalMode} />
        
        {/* Player Controls and Content */}
        <div className={cn("space-y-4", horizontalMode ? "flex-1" : "")}>
          {/* Artist info inside player in fullscreen mode - positioned at the top */}
          {isFullscreen && <div className="w-full py-3 px-4">
              <SocialLinks inFullscreen={true} />
            </div>}
          
          {/* Player content */}
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>;
};
export default PlayerLayoutUI;
