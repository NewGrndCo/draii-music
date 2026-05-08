
import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  const lastLogTime = useRef(Date.now());

  const logPerformance = useCallback(() => {
    // Only log in development and throttle heavily to reduce overhead
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      
      // Only log every 50 renders and not more than once every 10 seconds
      if (renderCount.current % 50 === 0 && (now - lastLogTime.current) > 10000) {
        const renderTime = now - startTime.current;
        console.log(`${componentName}: ${renderCount.current} renders, last took ${renderTime}ms`);
        lastLogTime.current = now;
      }
    }
  }, [componentName]);

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = Date.now();
    
    // Use RAF with reduced frequency to minimize performance impact
    if (renderCount.current % 10 === 0) {
      const rafId = requestAnimationFrame(logPerformance);
      return () => cancelAnimationFrame(rafId);
    }
  });

  return {
    renderCount: renderCount.current
  };
};
