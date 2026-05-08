import React, { useRef } from 'react';
import { useSwipeGestures } from '../../../hooks/useSwipeGestures';

interface PlayerSwipeGesturesProps {
  playNextSong: () => void;
  playPreviousSong: () => void;
  openLibrary: () => void;
  children: React.ReactNode;
}

const PlayerSwipeGestures: React.FC<PlayerSwipeGesturesProps> = ({
  playNextSong,
  playPreviousSong,
  openLibrary,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useSwipeGestures(containerRef, {
    onSwipeLeft: () => playNextSong(),
    onSwipeRight: () => playPreviousSong(),
    onSwipeUp: () => openLibrary(),
    threshold: 150,
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full touch-pan-y"
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default PlayerSwipeGestures;
