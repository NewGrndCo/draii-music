
import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
  onChange: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  formatTime,
  onChange
}) => {
  // Calculate progress percentage
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  
  // Format times for display
  const currentTimeFormatted = formatTime(currentTime);
  const durationFormatted = formatTime(duration);
  
  return (
    <div className="relative pt-2 pb-5">
      <div className="relative h-8 flex items-center">
      <div className="relative w-full h-1 bg-white/25 rounded-full">
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
          style={{ 
            width: `${progress}%`,
          }}
        />
        <div 
          className="absolute h-4 w-4 bg-white rounded-full shadow-sm pointer-events-none"
          style={{
            left: `clamp(8px, ${progress}%, calc(100% - 8px))`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      
      <input
        type="range"
        min={0}
        max={Number.isFinite(duration) && duration > 0 ? duration : 100}
        value={Number.isFinite(currentTime) ? Math.max(0, Math.min(currentTime, duration || 100)) : 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Seek song position"
        className="w-full h-8 absolute inset-0 opacity-0 cursor-pointer z-20"
      />
      </div>
      <div className="flex justify-between text-xs text-white/60">
        <span>{currentTimeFormatted}</span>
        <span>{durationFormatted}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
