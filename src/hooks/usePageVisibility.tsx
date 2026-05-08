
import { useEffect } from 'react';

interface PageVisibilityProps {
  onVisibilityChange?: (isVisible: boolean) => void;
}

export const usePageVisibility = ({ onVisibilityChange }: PageVisibilityProps) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      if (onVisibilityChange) {
        onVisibilityChange(isVisible);
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle when window loses focus or is closed
    window.addEventListener('blur', () => onVisibilityChange?.(false));
    window.addEventListener('beforeunload', () => onVisibilityChange?.(false));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', () => onVisibilityChange?.(false));
      window.removeEventListener('beforeunload', () => onVisibilityChange?.(false));
    };
  }, [onVisibilityChange]);
};
