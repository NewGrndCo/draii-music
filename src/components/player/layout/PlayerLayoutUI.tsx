import React from 'react';
import { cn } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';
import SocialLinks from '../SocialLinks';
import PlayerGlowEffects from '../PlayerGlowEffects';
import AlbumCoverDisplay from '../AlbumCoverDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
interface PlayerLayoutUIProps {
  gradientColor: string;
  lightPosition: {
    x: number;
    y: number;
  };
  currentSong: any;
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
  const isMobile = useIsMobile();
  return <div className="flex flex-col w-full h-full items-center justify-center relative z-20">
      {/* Only render SocialLinks outside player in non-fullscreen mode */}
      {!isFullscreen && <SocialLinks />}
      
      <div ref={playerContainerRef} className={cn("player-container backdrop-blur-sm transition-all duration-300 static-scale relative overflow-hidden", darkMode ? "bg-transparent border border-white/5 shadow-lg" : simpleTheme ? "bg-transparent border border-white/5 shadow-lg" : "bg-transparent border border-white/10 shadow-lg", horizontalMode ? "max-w-3xl w-full mx-auto rounded-lg overflow-hidden flex music-library-fullscreen" : isMobile ? "max-w-[95vw] w-full mx-auto rounded-lg overflow-hidden" : "max-w-sm w-full mx-auto rounded-lg overflow-hidden")}>
        {/* Dark mode toggle using logo/album art */}
        <div onClick={onToggleDarkMode} className="absolute top-2 left-2 z-10 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:text-white">
            {darkMode ? "☀️" : "🌙"}
          </div>
        </div>
        
        {/* Fullscreen button for horizontal mode */}
        {horizontalMode && <button onClick={onToggleFullscreen} className="absolute top-2 right-2 z-10 rounded-full p-1.5 transition-colors bg-black/40 hover:bg-black/60 text-white/70 hover:text-white" title="Toggle fullscreen">
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
          <div className="p-5 px-[12px] py-[10px]">
            {children}
          </div>
        </div>
      </div>
    </div>;
};
export default PlayerLayoutUI;