
import React from 'react';
import { Album } from '../data/musicData';
import { cn } from '@/lib/utils';
import { Disc, Sparkles } from 'lucide-react';
import { useAnimationContext } from '../hooks/useAnimationContext';

interface AlbumCoverProps {
  album: Album;
  isActive?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
  index?: number;
}

const AlbumCover: React.FC<AlbumCoverProps> = ({ 
  album, 
  isActive = false, 
  onClick,
  style,
  className,
  index = 0
}) => {
  const { setAnimatingSong, setAnimationStartPos } = useAnimationContext();
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Immediate response for better UX
    onClick();
    
    // Optional animation setup (non-blocking)
    const imgElement = e.currentTarget.querySelector('img');
    if (imgElement && album.songs && album.songs.length > 0) {
      const rect = imgElement.getBoundingClientRect();
      setAnimationStartPos({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
      setAnimatingSong(album.songs[0]);
    }
  };
  
  return (
    <div 
      className={cn(
        "relative cursor-pointer transition-transform duration-200",
        "hover:scale-105",
        isActive ? "ring-2 ring-music-purple shadow-neon scale-105" : "",
        className
      )}
      style={{ 
        ...style,
        '--index': index 
      } as React.CSSProperties}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-xl aspect-square">
        <img 
          src={album.coverArt} 
          alt={`${album.title} by ${album.artist}`} 
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            console.error('Failed to load album cover:', album.coverArt);
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
          }}
        />
        
        {isActive && (
          <div className="absolute top-2 right-2 text-music-purple animate-pulse z-10">
            <Sparkles size={16} />
          </div>
        )}
        
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-music-black/80 to-transparent p-4 flex flex-col justify-end transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-0 hover:opacity-100"
          )}
        >
          <div className="transform transition-transform duration-200 translate-y-2 hover:translate-y-0">
            <div className="flex items-center gap-2">
              <Disc size={14} className="text-music-purple" />
              <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1">{album.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-white/70">{album.artist}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCover;
