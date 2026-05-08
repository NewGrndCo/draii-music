
import React, { useRef } from 'react';
import { useSwipeGestures } from '../../../hooks/useSwipeGestures';

interface PlayerSwipeGesturesProps {
  playNextSong: () => void;
  playPreviousSong: () => void;
  openLibrary: () => void;
  hideEarnings: () => void;
  children: React.ReactNode;
}

const PlayerSwipeGestures: React.FC<PlayerSwipeGesturesProps> = ({
  playNextSong,
  playPreviousSong,
  openLibrary,
  hideEarnings,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Register swipe gestures for mobile with much higher thresholds to prevent accidental triggers
  useSwipeGestures(containerRef, {
    onSwipeLeft: () => {
      console.log('Swiped left, playing next song');
      playNextSong();
    },
    onSwipeRight: () => {
      console.log('Swiped right, playing previous song');
      playPreviousSong();
    },
    onSwipeUp: () => {
      // Make this much less sensitive - require very intentional upward swipe
      console.log('Swiped up strongly, opening library');
      openLibrary();
    },
    onSwipeDown: () => {
      console.log('Swiped down, hiding earnings');
      hideEarnings();
    },
    threshold: 150 // Significantly increased threshold from 100 to 150 pixels
  });
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full touch-pan-y"
      style={{
        // Prevent text selection and other touch interactions that might interfere
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  );
};

export default PlayerSwipeGestures;
