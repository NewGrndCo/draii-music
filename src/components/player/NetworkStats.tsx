
import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi } from 'lucide-react';

interface NetworkStatsProps {
  signalStrength: number;
  networkUserCount: number;
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ 
  signalStrength, 
  networkUserCount 
}) => {
  // Calculate signal strength (0-100)
  const signalPercent = Math.min(Math.round(signalStrength * 100), 100);
  
  // Determine WiFi icon color based on signal strength
  const getWifiColor = () => {
    if (signalPercent > 70) return "text-green-400 animate-pulse";
    if (signalPercent > 30) return "text-yellow-400 animate-pulse";
    return "text-red-400 animate-pulse";
  };
  
  return (
    <div className="flex items-center space-x-1">
      {/* WiFi icon with animated pulse */}
      <Wifi 
        size={14} 
        className={cn(
          "transition-all duration-300",
          getWifiColor()
        )} 
      />
    </div>
  );
};

export default NetworkStats;
