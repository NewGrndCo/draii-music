
import { useState, useCallback } from 'react';
import { extractColorFromImage } from '../../../data/musicData';

export const useGradientColor = () => {
  const [gradientColor, setGradientColor] = useState<string>('from-purple-500 via-pink-500 to-rose-500');
  
  // Memoize color extraction to avoid unnecessary processing
  const updateGradientColor = useCallback(async (coverArt: string) => {
    try {
      const color = await extractColorFromImage(coverArt);
      setGradientColor(color);
    } catch (error) {
      setGradientColor('from-purple-500 via-pink-500 to-rose-500');
    }
  }, []);
  
  return {
    gradientColor,
    updateGradientColor
  };
};
