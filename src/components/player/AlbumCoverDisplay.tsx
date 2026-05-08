
import React from 'react';
import { cn } from '@/lib/utils';
import { Album, Disc2 } from 'lucide-react';

interface AlbumCoverDisplayProps {
  currentSong: any;
  loading: boolean;
  horizontalMode?: boolean;
}

const AlbumCoverDisplay: React.FC<AlbumCoverDisplayProps> = ({
  currentSong,
  loading,
  horizontalMode = false
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden select-none", // add select-none, disables text selection and helps clarify no click
        horizontalMode 
          ? "min-w-[240px] w-[240px] h-[240px]" 
          : "w-full aspect-square"
      )}
      // REMOVED any onClick or interaction props
      style={{ pointerEvents: 'none' }} // ensures no pointer/click even if child image
    >
      {currentSong ? (
        <img 
          src={currentSong.coverArt} 
          alt={currentSong.title}
          className="w-full h-full object-cover"
          loading="eager"
          draggable={false}
          style={{ pointerEvents: 'none' }}
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

export default AlbumCoverDisplay;
