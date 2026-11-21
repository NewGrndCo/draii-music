import React from 'react';
import { cn } from '@/lib/utils';
import { Maximize2 } from 'lucide-react';
import SocialLinks from '../SocialLinks';
import PlayerGlowEffects from '../PlayerGlowEffects';
import AlbumCoverDisplay from '../AlbumCoverDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { Song } from '../../../data/musicData';
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
  onShowLibrary: () => void;
  onToggleFullscreen: () => void;
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
  onShowLibrary,
  onToggleFullscreen,
  playerContainerRef,
  children
}) => {
  const isMobile = useIsMobile();
  return <div className="flex flex-col w-full h-full items-center justify-center relative z-20">
      {/* Only render SocialLinks outside player in non-fullscreen mode */}
      {!isFullscreen && <SocialLinks />}
      
      <div ref={playerContainerRef} className={cn("player-container static-scale relative overflow-hidden bg-transparent", horizontalMode ? "max-w-3xl w-full mx-auto rounded-lg overflow-hidden flex music-library-fullscreen" : isMobile ? "max-w-[95vw] w-full mx-auto rounded-lg overflow-hidden" : "max-w-sm w-full mx-auto rounded-lg overflow-hidden")}>
        
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
