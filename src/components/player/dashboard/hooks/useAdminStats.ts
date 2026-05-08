
import { useEffect, useState } from 'react';

export interface AdminStats {
  kasBalance: number;
  solBalance: number;
  totalPlays: number;
  activeListeners: number;
  comments: number;
  likes: number;
  kasToSol: number;
  kasToUsd: number;
  solToUsd: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    kasBalance: 12634.89,
    solBalance: 94.76,
    totalPlays: 1247,
    activeListeners: 620,
    comments: 38,
    likes: 75,
    kasToSol: 0.0075, // 1 KAS = 0.0075 SOL
    kasToUsd: 0.67,   // 1 KAS = $0.67 USD
    solToUsd: 90,     // 1 SOL = $90 USD
  });

  // In a real application, you would fetch these stats from your backend
  // and update them periodically
  useEffect(() => {
    const updateStats = () => {
      // Simulate real-time updates
      setStats(prev => ({
        ...prev,
        activeListeners: prev.activeListeners + Math.floor(Math.random() * 3) - 1,
        totalPlays: prev.totalPlays + Math.floor(Math.random() * 2),
      }));
    };

    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate derived stats
  const kasValueInUsd = stats.kasBalance * stats.kasToUsd;
  const solValueInUsd = stats.solBalance * stats.solToUsd;

  return {
    ...stats,
    kasValueInUsd,
    solValueInUsd,
  };
};

