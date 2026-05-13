
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PlayerControlsUI from './controls/PlayerControlsUI';
import { AnimatePresence, motion } from 'framer-motion';

interface PlayerControlsProps {
  currentSong: any | null;
  playerState: {
    isPlaying: boolean;
    repeat: boolean;
    isReady?: boolean;
  };
  togglePlayPause: () => void;
  toggleRepeat: () => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  skipForward: () => void;
  skipBackward: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSong,
  playerState,
  togglePlayPause,
  toggleRepeat,
  playNextSong,
  playPreviousSong,
  skipForward,
  skipBackward
}) => {
  const [showSwipeLeft, setShowSwipeLeft] = useState(false);
  const [showSwipeRight, setShowSwipeRight] = useState(false);
  
  // Memoize animation handlers with reduced timeout for better performance
  const handleSwipeAnimationLeft = useCallback(() => {
    setShowSwipeLeft(true);
    setTimeout(() => setShowSwipeLeft(false), 600); // Reduced from 800ms
  }, []);
  
  const handleSwipeAnimationRight = useCallback(() => {
    setShowSwipeRight(true);
    setTimeout(() => setShowSwipeRight(false), 600); // Reduced from 800ms
  }, []);
  
  // Enhanced play functions with optimized animations
  const enhancedPlayNext = useCallback(() => {
    handleSwipeAnimationLeft();
    playNextSong();
  }, [handleSwipeAnimationLeft, playNextSong]);
  
  const enhancedPlayPrevious = useCallback(() => {
    handleSwipeAnimationRight();
    playPreviousSong();
  }, [handleSwipeAnimationRight, playPreviousSong]);
  
  // Optimized swipe event listener
  useEffect(() => {
    const handleSwipeEvent = (e: CustomEvent) => {
      if (e.detail.direction === 'left') {
        handleSwipeAnimationLeft();
      } else if (e.detail.direction === 'right') {
        handleSwipeAnimationRight();
      }
    };
    
    document.addEventListener('swipe-gesture', handleSwipeEvent as any, { passive: true });
    return () => {
      document.removeEventListener('swipe-gesture', handleSwipeEvent as any);
    };
  }, [handleSwipeAnimationLeft, handleSwipeAnimationRight]);
  
  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      setShowSwipeLeft(false);
      setShowSwipeRight(false);
    };
  }, []);
  
  // Memoize loading state check
  const isAudioLoading = useMemo(() => {
    return Boolean(currentSong && playerState.isPlaying && playerState.isReady === false);
  }, [currentSong, playerState.isPlaying, playerState.isReady]);
  
  // Memoize swipe animations with optimized performance
  const swipeAnimations = useMemo(() => (
    <AnimatePresence mode="wait">
      {showSwipeLeft && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} // Reduced duration
        >
          <motion.div 
            className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
            initial={{ x: 0, scale: 0.8 }}
            animate={{ x: -40, scale: 1 }} // Reduced movement
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.4 }} // Reduced duration
          >
            <span className="text-2xl">›</span>
          </motion.div>
        </motion.div>
      )}
      
      {showSwipeRight && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
            initial={{ x: 0, scale: 0.8 }}
            animate={{ x: 40, scale: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-2xl">‹</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [showSwipeLeft, showSwipeRight]);
  
  return (
    <>
      {swipeAnimations}
      
      <PlayerControlsUI
        isPlaying={playerState.isPlaying}
        hasCurrentSong={!!currentSong}
        onTogglePlayPause={togglePlayPause}
        onPlayNext={enhancedPlayNext}
        onPlayPrevious={enhancedPlayPrevious}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        repeat={playerState.repeat}
        onToggleRepeat={toggleRepeat}
        isLoading={isAudioLoading}
      />
    </>
  );
};

export default React.memo(PlayerControls);
