import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Album, Disc2 } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface AlbumCoverDisplayProps {
  currentSong: any;
  loading: boolean;
  horizontalMode?: boolean;
}

const AlbumCoverDisplay: React.FC<AlbumCoverDisplayProps> = ({
  currentSong,
  loading,
  horizontalMode = false,
}) => {
  const { playNextSong, playPreviousSong, openLibrary } = usePlayer();

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const swiped = useRef<boolean>(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swiped.current = false;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX > 40 && absX > absY * 1.2) {
      swiped.current = true;
      if (dx < 0) playNextSong();
      else playPreviousSong();
      return;
    }

    // Tap (small movement) — detect double tap
    if (absX < 10 && absY < 10) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        openLibrary(horizontalMode);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  }, [playNextSong, playPreviousSong, openLibrary, horizontalMode]);

  const onDoubleClick = useCallback(() => {
    openLibrary(horizontalMode);
  }, [openLibrary, horizontalMode]);

  return (
    <div
      className={cn(
        'relative overflow-hidden select-none cursor-pointer touch-pan-y',
        horizontalMode ? 'min-w-[240px] w-[240px] h-[240px]' : 'w-full aspect-square'
      )}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onDoubleClick={onDoubleClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {currentSong ? (
        <img
          src={currentSong.coverArt}
          alt={currentSong.title}
          className="w-full h-full object-cover pointer-events-none"
          loading="eager"
          {...({ fetchpriority: 'high' } as any)}
          decoding="async"
          draggable={false}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
        />

      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          {loading ? (
            <div className="animate-pulse">
              <Disc2 className="text-white/40 w-12 h-12" />
            </div>
          ) : (
            <Album className="text-white/30 w-12 h-12" />
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AlbumCoverDisplay);
