
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward, Repeat, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlayerControlsUIProps {
  isPlaying: boolean;
  hasCurrentSong: boolean;
  repeat: boolean;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onToggleRepeat: () => void;
  isLoading?: boolean;
}

const PlayerControlsUI: React.FC<PlayerControlsUIProps> = ({
  isPlaying,
  hasCurrentSong,
  repeat,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrevious,
  onSkipForward,
  onSkipBackward,
  onToggleRepeat,
  isLoading = false
}) => {
  // Prevent event propagation to avoid interference with other functions
  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };
  
  return (
    <div className="flex items-center justify-center space-x-3 py-[6px]">
      {/* Skip Backward - always available when song exists */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleButtonClick(onSkipBackward)} 
        disabled={!hasCurrentSong} 
        className="text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation" 
        aria-label="Skip backward 10 seconds"
      >
        <Rewind size={17} />
      </Button>
      
      {/* Previous Song - always available when song exists */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleButtonClick(onPlayPrevious)} 
        disabled={!hasCurrentSong} 
        className="text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation" 
        aria-label="Previous song"
      >
        <SkipBack size={20} />
      </Button>
      
      {/* Play/Pause - only disabled by loading for current song */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleButtonClick(onTogglePlayPause)} 
        disabled={!hasCurrentSong} 
        className={cn(
          "rounded-full border border-white/20 w-12 h-12 transition-all active:scale-95 touch-manipulation", 
          isPlaying ? "bg-white text-black hover:bg-white/90" : "bg-transparent text-white hover:bg-white/10"
        )} 
        aria-label={isPlaying ? "Pause" : "Play"}
        style={{ touchAction: "manipulation" }}
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={20} />
        ) : (
          <Play size={20} className="ml-1" />
        )}
      </Button>
      
      {/* Next Song - always available when song exists */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleButtonClick(onPlayNext)} 
        disabled={!hasCurrentSong} 
        className="text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation" 
        aria-label="Next song"
      >
        <SkipForward size={20} />
      </Button>
      
      {/* Skip Forward - always available when song exists */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleButtonClick(onSkipForward)} 
        disabled={!hasCurrentSong} 
        className="text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation" 
        aria-label="Skip forward 10 seconds"
      >
        <FastForward size={17} />
      </Button>
      
      {/* Repeat Button - always available when song exists */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleButtonClick(onToggleRepeat)} 
        disabled={!hasCurrentSong}
        className={cn(
          "text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation",
          repeat && "text-purple-400"
        )}
        aria-label="Toggle repeat"
      >
        <Repeat size={16} />
      </Button>
    </div>
  );
};

export default PlayerControlsUI;
