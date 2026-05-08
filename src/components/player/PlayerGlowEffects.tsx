
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PlayerGlowEffectsProps {
  gradientColor: string;
  lightPosition: {
    x: number;
    y: number;
  };
}

const PlayerGlowEffects: React.FC<PlayerGlowEffectsProps> = ({
  gradientColor,
  lightPosition
}) => {
  const [simpleTheme, setSimpleTheme] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Listen for theme toggle events
  useEffect(() => {
    const handleToggleSimpleTheme = () => {
      setSimpleTheme(prev => !prev);
    };
    
    const handleToggleDarkMode = (event: CustomEvent) => {
      setDarkMode(event.detail.darkMode);
    };
    
    // Add event listeners
    document.addEventListener('toggle-simple-theme', handleToggleSimpleTheme as EventListener);
    document.addEventListener('toggle-dark-mode', handleToggleDarkMode as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener('toggle-simple-theme', handleToggleSimpleTheme as EventListener);
      document.removeEventListener('toggle-dark-mode', handleToggleDarkMode as EventListener);
    };
  }, []);
  
  return (
    <>
      {/* Background gradient effects */}
      <div className="absolute -z-10 inset-0 opacity-30">
        <div className={cn(
          "absolute inset-0",
          darkMode ? 'bg-gray-900' : 'bg-black',
          "transition-colors duration-700"
        )}></div>
        
        {!simpleTheme && !darkMode && (
          <>
            {/* Animated gradient blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-[10%] left-[20%] w-32 h-32 rounded-full bg-music-blue/20 blur-2xl mix-blend-screen animate-spin-slow"></div>
              <div className="absolute bottom-[20%] right-[10%] w-48 h-48 rounded-full bg-music-purple/20 blur-2xl mix-blend-screen animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
              <div className="absolute top-[40%] right-[30%] w-24 h-24 rounded-full bg-music-pink/20 blur-2xl mix-blend-screen animate-spin-slow" style={{ animationDuration: '15s' }}></div>
            </div>
          </>
        )}
      </div>
      
      {/* Interactive light effect that follows mouse/touch */}
      {!simpleTheme && !darkMode && (
        <div 
          className={cn(
            "absolute -z-5 opacity-20 w-40 h-40 rounded-full",
            "transition-all duration-500 ease-out"
          )}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            left: `${lightPosition.x}%`,
            top: `${lightPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* Sleek sci-fi border glow effect */}
      {!simpleTheme && !darkMode && (
        <div 
          className={cn(
            "absolute inset-0 rounded-lg z-0",
            "animate-glow",
            "pointer-events-none"
          )}
        />
      )}
    </>
  );
};

export default PlayerGlowEffects;
