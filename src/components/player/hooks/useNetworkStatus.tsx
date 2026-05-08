
import { useState, useEffect, useRef } from 'react';

export const useNetworkStatus = () => {
  const [networkUserCount, setNetworkUserCount] = useState<number>(Math.floor(Math.random() * 15) + 5);
  const [signalStrength, setSignalStrength] = useState<number>(Math.random() * 0.2 + 0.8);
  const networkUpdateIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    networkUpdateIntervalRef.current = window.setInterval(() => {
      const currentCount = networkUserCount;
      const change = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
      const newCount = Math.max(3, Math.min(23, currentCount + change));
      setNetworkUserCount(newCount);
    }, 15000);
    
    return () => {
      if (networkUpdateIntervalRef.current !== null) {
        clearInterval(networkUpdateIntervalRef.current);
      }
    };
  }, [networkUserCount]);

  useEffect(() => {
    const signalUpdateInterval = window.setInterval(() => {
      const newSignal = Math.max(0.8, Math.min(1.0, 
        signalStrength + (Math.random() - 0.5) * 0.1
      ));
      setSignalStrength(newSignal);
    }, 5000);
    
    return () => clearInterval(signalUpdateInterval);
  }, [signalStrength]);

  return {
    networkUserCount,
    signalStrength
  };
};
