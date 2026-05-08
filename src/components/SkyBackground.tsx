
import React, { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MoonPhase = 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 
                 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';

const SkyBackground: React.FC = () => {
  const [moonPhase, setMoonPhase] = useState<MoonPhase>('new');
  const [stars, setStars] = useState<Array<{x: number, y: number, size: number, opacity: number}>>([]);
  
  // Create stars on component mount
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 80; i++) {
        newStars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, []);
  
  // Moon phase rotation every 3 minutes
  useEffect(() => {
    const phases: MoonPhase[] = [
      'new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 
      'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'
    ];
    
    let currentIndex = 0;
    setMoonPhase(phases[currentIndex]);
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setMoonPhase(phases[currentIndex]);
    }, 3 * 60 * 1000); // 3 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  const getMoonStyles = (): React.CSSProperties => {
    // Different styles for different moon phases
    switch(moonPhase) {
      case 'new':
        return { opacity: 0.3 };
      case 'waxing-crescent':
        return { 
          boxShadow: 'inset -5px 0 0 0 #000, 0 0 20px rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      case 'first-quarter':
        return { 
          boxShadow: 'inset -10px 0 0 0 #000, 0 0 20px rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      case 'waxing-gibbous':
        return { 
          boxShadow: 'inset -3px 0 0 0 #000, 0 0 20px rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      case 'full':
        return { 
          boxShadow: '0 0 30px 5px rgba(99, 102, 241, 0.7)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      case 'waning-gibbous':
        return { 
          boxShadow: 'inset 3px 0 0 0 #000, 0 0 20px rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      case 'last-quarter':
        return { 
          boxShadow: 'inset 10px 0 0 0 #000, 0 0 20px rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      case 'waning-crescent':
        return { 
          boxShadow: 'inset 5px 0 0 0 #000, 0 0 20px rgba(99, 102, 241, 0.5)',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        };
      default:
        return {};
    }
  };
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-black bg-opacity-90">
        {/* Stars */}
        {stars.map((star, index) => (
          <div 
            key={index}
            className={cn(
              "absolute rounded-full bg-white",
              index % 3 === 0 ? "animate-pulse" : ""
            )}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
        
        {/* Sci-fi Glowing Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.3) 25%, rgba(99, 102, 241, 0.3) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.3) 75%, rgba(99, 102, 241, 0.3) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.3) 25%, rgba(99, 102, 241, 0.3) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.3) 75%, rgba(99, 102, 241, 0.3) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Moon */}
        <div 
          className="absolute right-[10%] top-[10%] w-16 h-16 transition-all duration-1000"
          style={{...getMoonStyles(), position: "fixed"}}
        >
          <Moon
            size={64}
            className="text-white"
            fill="white"
            strokeWidth={0.5}
          />
        </div>
      </div>
    </div>
  );
};

export default SkyBackground;
