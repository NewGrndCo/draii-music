
import { useState, useEffect, useRef } from 'react';

export const useVisualEffects = () => {
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  const lightMoveIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    lightMoveIntervalRef.current = window.setInterval(() => {
      setLightPosition({
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40
      });
    }, 8000);
    
    return () => {
      if (lightMoveIntervalRef.current !== null) {
        clearInterval(lightMoveIntervalRef.current);
      }
    };
  }, []);

  return { lightPosition };
};
