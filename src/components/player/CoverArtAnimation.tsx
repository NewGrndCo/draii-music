
import React, { useEffect, useState } from 'react';
import { useAnimationContext } from '../../hooks/useAnimationContext';
import { cn } from '@/lib/utils';

const CoverArtAnimation: React.FC = () => {
  const { animatingSong, animationStartPos, resetAnimation } = useAnimationContext();
  const [animationActive, setAnimationActive] = useState(false);
  
  useEffect(() => {
    if (animatingSong && animationStartPos) {
      setAnimationActive(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setAnimationActive(false);
        setTimeout(resetAnimation, 100); // Small delay before completely removing
      }, 600); // Match with animation duration
      
      return () => clearTimeout(timer);
    }
  }, [animatingSong, animationStartPos, resetAnimation]);
  
  if (!animatingSong || !animationStartPos) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className={cn(
          "absolute rounded-md overflow-hidden transition-all duration-600",
          animationActive ? "opacity-1" : "opacity-0",
          animationActive && "animate-cover-art-transform"
        )}
        style={{
          left: animationActive ? '50%' : `${animationStartPos.x}px`,
          top: animationActive ? '50%' : `${animationStartPos.y}px`,
          width: animationActive ? '300px' : `${animationStartPos.width}px`,
          height: animationActive ? '300px' : `${animationStartPos.height}px`,
          transform: animationActive ? 'translate(-50%, -50%)' : 'none',
          transformOrigin: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}
      >
        <img
          src={animatingSong.coverArt}
          alt={animatingSong.title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default CoverArtAnimation;
