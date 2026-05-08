
import React, { createContext, useContext, useState, useRef } from 'react';
import { Song } from '../data/musicData';

interface AnimationContextType {
  animatingSong: Song | null;
  animationStartPos: { x: number; y: number; width: number; height: number } | null;
  setAnimatingSong: (song: Song | null) => void;
  setAnimationStartPos: (pos: { x: number; y: number; width: number; height: number } | null) => void;
  resetAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animatingSong, setAnimatingSong] = useState<Song | null>(null);
  const [animationStartPos, setAnimationStartPos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const resetAnimation = () => {
    setAnimatingSong(null);
    setAnimationStartPos(null);
  };

  return (
    <AnimationContext.Provider 
      value={{ 
        animatingSong, 
        animationStartPos, 
        setAnimatingSong, 
        setAnimationStartPos,
        resetAnimation
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
};
