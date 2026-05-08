
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarUIProps {
  currentTime: number;
  duration: number;
  progressPercentage: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  gradientColor: string;
  disabled: boolean;
}

const ProgressBarUI: React.FC<ProgressBarUIProps> = ({
  currentTime,
  duration,
  progressPercentage,
  formattedCurrentTime,
  formattedDuration,
  onSeekChange,
  onDragStart,
  onDragEnd,
  gradientColor,
  disabled
}) => {
  return (
    <>
      <div className="relative h-8 flex items-center">
        <div className="absolute bottom-1/2 left-0 w-full h-2 bg-black/30 z-10 rounded-full transform translate-y-1/2">
          <div 
            className={cn(
              "absolute bottom-0 left-0 h-full rounded-full z-10 bg-gradient-to-r",
              gradientColor
            )}
            style={{ 
              width: `${progressPercentage}%`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.3)'
            }}
          />
          <div 
            className="absolute h-4 w-4 bg-white rounded-full shadow-xl z-20 transform -translate-y-1/4"
            style={{
              left: `${progressPercentage}%`,
              top: '50%',
              boxShadow: '0 0 8px rgba(255, 255, 255, 1), 0 0 12px rgba(255, 255, 255, 0.5)'
            }}
          />
        </div>
        
        <input
          type="range"
          min={0}
          max={!isNaN(duration) ? duration : 100}
          value={currentTime}
          onChange={onSeekChange}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          className="w-full h-8 absolute opacity-0 cursor-pointer z-20"
          disabled={disabled}
        />
      </div>
      
      <div className="flex justify-between text-xs text-white/50 -mt-2">
        <span>{formattedCurrentTime}</span>
        <span>{formattedDuration}</span>
      </div>
    </>
  );
};

export default ProgressBarUI;
