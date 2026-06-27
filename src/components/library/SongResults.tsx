
import React, { useRef } from 'react';
import { Song } from '../../data/musicData';
import { Music, Heart, AudioLines, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnimationContext } from '../../hooks/useAnimationContext';
import { generateShareLink, copyToClipboard } from '../../utils/shareUtils';
import { toast } from 'sonner';
import SmartCover from '@/components/shared/SmartCover';

interface SongResultsProps {
  songs: Song[];
  title: string;
  onSelectSong: (song: Song) => void;
  compact?: boolean;
  onToggleLike?: (songId: string) => void;
  likedSongs?: string[];
}

const SongResults: React.FC<SongResultsProps> = ({ 
  songs, 
  title, 
  onSelectSong,
  compact = true,
  onToggleLike,
  likedSongs = []
}) => {
  const { setAnimatingSong, setAnimationStartPos } = useAnimationContext();
  const songRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  if (songs.length === 0) return null;
  
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
  
  const handleSongSelect = (song: Song, e: React.MouseEvent<HTMLDivElement>) => {
    // Find the image element within the clicked song
    const imgElement = e.currentTarget.querySelector('img');
    if (imgElement) {
      const rect = imgElement.getBoundingClientRect();
      
      // Set animation start position and song
      setAnimationStartPos({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
      setAnimatingSong(song);
      
      // Slight delay to allow animation to start before library closes
      setTimeout(() => {
        onSelectSong(song);
      }, 50);
    } else {
      // Fallback if no image found
      onSelectSong(song);
    }
  };
  
  const handleShareSong = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation(); // Prevent song selection
    
    try {
      const shareLink = generateShareLink(song);
      await copyToClipboard(shareLink);
      
      toast.success('Link copied to clipboard!', {
        description: `Share "${song.title}" with friends`,
        duration: 3000
      });
    } catch (error) {
      toast.error('Failed to copy link', {
        duration: 2000
      });
    }
  };

  const handleTouchStart = (songId: string, e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    const element = songRefs.current.get(songId);
    
    if (!element) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      const diff = currentX - touchStartX;
      
      // Limit swipe distance
      const swipeX = Math.min(Math.max(diff, -80), 0);
      
      // Apply transform
      element.style.transform = `translateX(${swipeX}px)`;
      
      // Show/hide like button based on swipe distance
      const likeButton = element.querySelector('.swipe-like-button');
      if (likeButton) {
        (likeButton as HTMLElement).style.opacity = Math.min((-swipeX / 50), 1).toString();
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const currentX = e.changedTouches[0].clientX;
      const diff = currentX - touchStartX;
      
      // If swiped enough to the left, trigger like action
      if (diff < -50 && onToggleLike) {
        onToggleLike(songId);
      }
      
      // Reset position with animation
      element.style.transition = 'transform 0.3s ease';
      element.style.transform = 'translateX(0)';
      
      // Hide like button
      const likeButton = element.querySelector('.swipe-like-button');
      if (likeButton) {
        (likeButton as HTMLElement).style.opacity = '0';
      }
      
      // Clean up
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // Reset transition after animation completes
      setTimeout(() => {
        if (element) element.style.transition = '';
      }, 300);
    };
    
    // Add event listeners
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Music size={20} className="text-white" />
        <h3 className="text-base font-medium text-white">{title}</h3>
      </div>
      
      <div className={compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"}>
        {songs.map((song, index) => (
          <div 
            key={song.id}
            ref={el => {
              if (el) songRefs.current.set(song.id, el);
              else songRefs.current.delete(song.id);
            }}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg bg-black/30 cursor-pointer transition-all",
              "border border-white/5 hover:border-white/10 relative overflow-hidden"
            )}
            onClick={(e) => handleSongSelect(song, e)}
            onTouchStart={(e) => handleTouchStart(song.id, e)}
          >
            <SmartCover
              src={song.coverArt}
              alt={song.title}
              className="w-12 h-12 rounded-md object-cover shadow-md"
              iconClassName="h-4 w-4"
            />

            <div className="flex-1 overflow-hidden">
              <p className="text-sm text-white font-medium truncate">{song.title}</p>
              <p className="text-xs text-white/70 truncate">{song.artist}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <AudioLines size={14} className="text-cyan-400/80" />
                <span>{formatCount(song.playCount || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart 
                  size={14} 
                  className={cn(
                    likedSongs.includes(song.id) ? "text-pink-500" : "text-white/50"
                  )} 
                  fill={likedSongs.includes(song.id) ? "currentColor" : "none"} 
                />
                <span>{formatCount(song.likesCount || 0)}</span>
              </div>
              <button
                onClick={(e) => handleShareSong(e, song)}
                className="text-white/50 hover:text-white transition-colors"
                title="Share song"
              >
                <Share2 size={14} />
              </button>
            </div>
            
            {/* Swipe to like UI */}
            <div className="swipe-like-button absolute right-0 top-0 bottom-0 bg-black/50 flex items-center px-4 opacity-0 transition-opacity">
              <Heart 
                size={20} 
                className="text-pink-500" 
                fill={likedSongs.includes(song.id) ? "currentColor" : "none"} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongResults;
