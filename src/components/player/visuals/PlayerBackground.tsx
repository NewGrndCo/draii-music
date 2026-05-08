
import React from 'react';

interface PlayerBackgroundProps {
  horizontalMode: boolean;
  gradientColor: string;
  children: React.ReactNode;
  darkMode?: boolean;
}

const PlayerBackground: React.FC<PlayerBackgroundProps> = ({
  horizontalMode,
  gradientColor,
  children,
  darkMode = false
}) => {
  // Generate dynamic background based on the provided gradient color and mode
  const getBackgroundStyle = () => {
    if (darkMode) {
      return { background: 'transparent' };
    }
    
    // For non-dark mode, apply a subtle gradient based on the provided color
    return {
      background: 'transparent',
      position: 'relative' as const,
      zIndex: 0
    };
  };
  
  return (
    <div className="w-full h-full" style={getBackgroundStyle()}>
      {children}
    </div>
  );
};

export default PlayerBackground;
