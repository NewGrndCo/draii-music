
import React from 'react';
import ProgressBarUI from './controls/ProgressBarUI';

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
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Format times for display
  const currentTimeFormatted = formatTime(currentTime);
  const durationFormatted = formatTime(duration);
  
  // Handle seek
  const handleSeek = (percent: number) => {
    const newTime = (percent / 100) * duration;
    onChange(newTime);
  };
  
  return (
    <div className="relative h-8 flex items-center">
      <div className="absolute bottom-1/2 left-0 w-full h-2 bg-black/30 z-10 rounded-full transform translate-y-1/2">
        <div 
          className="absolute bottom-0 left-0 h-full rounded-full z-10 bg-gradient-to-r from-purple-500 to-blue-500"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.3)'
          }}
        />
        <div 
          className="absolute h-4 w-4 bg-white rounded-full shadow-xl z-20 transform -translate-y-1/4"
          style={{
            left: `${progress}%`,
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
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-8 absolute opacity-0 cursor-pointer z-20"
      />
      
      <div className="flex justify-between text-xs text-white/50 -mt-2 w-full absolute bottom-[-18px]">
        <span>{currentTimeFormatted}</span>
        <span>{durationFormatted}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
