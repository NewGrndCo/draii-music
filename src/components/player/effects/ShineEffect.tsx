
import React, { useRef, useEffect, useState } from 'react';

interface ShineEffectProps {
  lightPosition: { x: number; y: number };
  children: React.ReactNode;
}

const ShineEffect: React.FC<ShineEffectProps> = ({ 
  lightPosition, 
  children 
}) => {
  const shineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Add mouse move tracking for light effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
      
      // Update the light position for the shine effect
      if (shineRef.current) {
        shineRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15), transparent 80%)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div ref={containerRef} className="relative overflow-hidden w-full h-full">
      {/* Interactive shine effect */}
      <div
        ref={shineRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 opacity-50"
        style={{
          background: `radial-gradient(circle at ${lightPosition.x}% ${lightPosition.y}%, rgba(255,255,255,0.15), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default ShineEffect;
