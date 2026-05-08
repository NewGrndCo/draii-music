import React from 'react';
import { Heart, AudioLines } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionButtonsProps {
  liked: boolean;
  heartAnimation: boolean;
  playCount: number;
  likesCount: number;
  toggleLike: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  liked,
  heartAnimation,
  playCount,
  likesCount,
  toggleLike,
}) => {
  const formatCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="flex items-center justify-center space-x-6 mt-2 py-2">
      <div className="flex items-center space-x-1.5 text-white/70">
        <AudioLines size={18} />
        <span className="text-sm">{formatCount(playCount)}</span>
      </div>

      <div className="flex items-center space-x-1.5" data-swipe-action="like">
        <button
          onClick={toggleLike}
          className={cn(
            'relative group transition-colors flex items-center',
            liked ? 'text-red-500' : 'text-white/70 hover:text-white'
          )}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={18}
            fill={liked ? 'currentColor' : 'none'}
            className={cn('transition-transform', heartAnimation ? 'animate-heart-pulse' : '')}
          />
        </button>
        <span className="text-sm text-white/70">{formatCount(likesCount)}</span>
      </div>
    </div>
  );
};

export default ActionButtons;
