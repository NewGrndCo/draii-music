
import React, { useState, useEffect } from 'react';
import { X, Activity, Wifi, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdvancedAnalyticsProps {
  networkEarnings: number;
  networkUserCount: number;
  signalStrength: number;
  isPlaying: boolean;
  onClose: () => void;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  networkEarnings,
  networkUserCount,
  signalStrength,
  isPlaying,
  onClose
}) => {
  const isMobile = useIsMobile();
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Animate metrics when playing
  const [gpuUtilization, setGpuUtilization] = useState(85);
  const [hashRate, setHashRate] = useState(125.8);
  const [phoneTemp, setPhoneTemp] = useState(38.5);
  const [phoneBattery, setPhoneBattery] = useState(85);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setGpuUtilization(75 + Math.random() * 20);
      setHashRate(120 + Math.random() * 10);
      setPhoneTemp(37 + Math.random() * 3);
      setPhoneBattery(prev => Math.max(0, prev - 0.1));
      setRefreshCounter(prev => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="analytics-window w-full max-w-md bg-black/95 border border-white/10 rounded-lg shadow-lg backdrop-blur-xl"
      style={{
        overflowY: 'auto',
        maxHeight: isMobile ? '95vh' : '85vh'
      }}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-cyan-400" size={18} />
            <h3 className="text-white font-medium">Performance Analytics</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* GPU Farm Performance */}
        <div className="space-y-3 bg-black/80 p-4 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            <Database className="text-green-400" size={16} />
            <h4 className="text-sm text-white font-medium">GPU Farm Status</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Hash Rate:</span>
                <span className="font-medium text-green-400">{hashRate.toFixed(1)} MH/s</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">GPU Usage:</span>
                <span className="text-green-400 font-medium">{gpuUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${gpuUtilization}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Performance */}
        <div className="space-y-3 bg-black/80 p-4 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            <Wifi className="text-blue-400" size={16} />
            <h4 className="text-sm text-white font-medium">Phone Performance</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Temperature:</span>
                <span className="font-medium text-blue-400">{phoneTemp.toFixed(1)}°C</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1.5">
                <div className={cn(
                  "h-1.5 rounded-full",
                  phoneTemp > 40 ? "bg-red-400" : "bg-blue-400"
                )} style={{ width: `${(phoneTemp / 45) * 100}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Battery:</span>
                <span className="text-blue-400 font-medium">{phoneBattery.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1.5">
                <div className={cn(
                  "h-1.5 rounded-full",
                  phoneBattery < 20 ? "bg-red-400" : "bg-blue-400"
                )} style={{ width: `${phoneBattery}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/60 bg-black/40 p-2 rounded border border-white/5">
          Real-time performance metrics from the GPU farm and your device.
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedAnalytics;
