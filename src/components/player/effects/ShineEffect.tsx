
import React from 'react';

interface ShineEffectProps {
  lightPosition: { x: number; y: number };
  children: React.ReactNode;
}

const ShineEffect: React.FC<ShineEffectProps> = ({ 
  lightPosition, 
  children 
}) => {
  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Interactive shine effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(circle at ${lightPosition.x}% ${lightPosition.y}%, rgba(255,255,255,0.15), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default ShineEffect;
