
import React from 'react';
import { Heart, AudioLines, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionButtonsProps {
  liked: boolean;
  heartAnimation: boolean;
  playCount: number;
  likesCount: number;
  showEarnings: boolean;
  isBoosted: boolean;
  toggleLike: () => void;
  toggleEarnings: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  liked,
  heartAnimation,
  playCount,
  likesCount,
  showEarnings,
  isBoosted,
  toggleLike,
  toggleEarnings
}) => {
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
  
  return (
    <div className="flex items-center justify-center space-x-6 mt-2 py-2">
      {/* Play count with audio wave icon */}
      <div className="flex items-center space-x-1.5 text-white/70">
        <AudioLines size={18} />
        <span className="text-sm">{formatCount(playCount)}</span>
      </div>
      
      {/* Like button and count */}
      <div 
        className="flex items-center space-x-1.5"
        data-swipe-action="like"
      >
        <button 
          onClick={toggleLike} 
          className={cn(
            "relative group transition-colors flex items-center", 
            liked ? "text-red-500" : "text-white/70 hover:text-white"
          )} 
          title={liked ? "Unlike" : "Like"}
        >
          <Heart 
            size={18} 
            fill={liked ? "currentColor" : "none"} 
            className={cn(
              "transition-transform", 
              heartAnimation ? "animate-heart-pulse" : ""
            )} 
          />
          {/* Removed floating +1 and heart value */}
        </button>
        <span className="text-sm text-white/70">{formatCount(likesCount)}</span>
      </div>
      
      {/* Support button */}
      <button 
        onClick={toggleEarnings} 
        className={cn(
          "text-white/70 hover:text-white transition-colors", 
          isBoosted ? "text-blue-400" : "text-green-400"
        )} 
        title="Support Fund"
      >
        <Coins size={18} />
      </button>
    </div>
  );
};

export default ActionButtons;

