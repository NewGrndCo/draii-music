
import React, { memo, useEffect, useState } from 'react';
import { Song } from '../../data/musicData';
import { useIsMobile } from '@/hooks/use-mobile';
import { Heart, AudioLines, Search, X, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

interface NextUpSongsProps {
  nextSongs: Song[];
  onSelectSong: (song: Song) => void;
  horizontalMode?: boolean;
  openLibrary?: () => void;  // Prop to open library
}

const NextUpSongs: React.FC<NextUpSongsProps> = ({ 
  nextSongs, 
  onSelectSong, 
  horizontalMode = false,
  openLibrary
}) => {
  const [displaySongs, setDisplaySongs] = useState<Song[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Update songs to display based on fullscreen mode and nextSongs
  useEffect(() => {
    if (openLibrary) {
      // When openLibrary is available, we only show a short preview (3-6 songs)
      const songCount = horizontalMode ? 6 : 5;
      setDisplaySongs(
        nextSongs.length > 0 ? 
        nextSongs.slice(0, Math.min(songCount, Math.max(3, nextSongs.length))) : 
        []
      );
    } else {
      // If openLibrary is not provided, show all nextSongs
      setDisplaySongs(nextSongs);
    }
  }, [nextSongs, horizontalMode, openLibrary]);
  
  // Format numbers for display with k/M suffix
  const formatCount = (count: number) => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    } else if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}k`;
    } else {
      return count.toString();
    }
  };

  if (displaySongs.length === 0) return null;

  return (
    <div className={cn("mt-2 mb-4")}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase text-white font-medium">
          Next Up
        </h3>
        <div className="flex items-center space-x-1">
          {openLibrary && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 py-1 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => openLibrary()}
              aria-label="Open library"
            >
              See All
            </Button>
          )}
        </div>
      </div>
      {/* List layout for normal mode with glass effect */}
      <div className="space-y-1">
        {displaySongs.map((song) => (
          <div 
            key={song.id}
            className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors border border-white/5"
            onClick={() => onSelectSong(song)}
          >
            <div className="relative">
              <img 
                src={song.coverArt} 
                alt={song.title} 
                className="w-8 h-8 rounded-md"
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 rounded-md"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-white font-medium truncate">{song.title}</p>
              <p className="text-xs text-white/80 truncate">{song.artist}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <AudioLines size={12} />
                <span>{formatCount(song.playCount || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={12} className={cn(song.likesCount > 0 ? "text-red-500" : "")} fill={song.likesCount > 0 ? "currentColor" : "none"} />
                <span>{formatCount(song.likesCount || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(NextUpSongs);
