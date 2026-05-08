import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, BarChart2 } from 'lucide-react';
import EncryptionTerminal from './EncryptionTerminal';

interface SystemOverviewProps {
  gpuStats: {
    rtx5090: { total: number; online: number },
    rtx4090: { total: number; online: number }
  };
  cpuStats: {
    total: number; 
    active: number;
  };
  healthStatus: 'optimal' | 'degraded' | 'failure';
  hashrate: number;
}

const SystemOverviewHeader: React.FC<SystemOverviewProps> = ({ 
  gpuStats, 
  cpuStats, 
  healthStatus,
  hashrate
}) => {
  // Helper function to render health status
  const renderHealthStatus = () => {
    switch(healthStatus) {
      case 'optimal':
        return (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>Optimal</span>
          </div>
        );
      case 'degraded':
        return (
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Degraded</span>
          </div>
        );
      case 'failure':
        return (
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <span>Failure</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border-0">
        <div className="p-6">
          <h3 className="text-xl font-medium text-white mb-4">System Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* GPU Status */}
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 text-sm mb-1">GPUs Online/Total</p>
              <p className="text-xl font-bold text-white">
                {gpuStats.rtx5090.online + gpuStats.rtx4090.online}/{gpuStats.rtx5090.total + gpuStats.rtx4090.total}
              </p>
              <div className="text-xs text-gray-400 space-y-1 mt-2">
                <p>RTX 5090: {gpuStats.rtx5090.online}/{gpuStats.rtx5090.total}</p>
                <p>RTX 4090: {gpuStats.rtx4090.online}/{gpuStats.rtx4090.total}</p>
              </div>
            </div>
            
            {/* CPU Status */}
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 text-sm mb-1">CPUs Active/Total</p>
              <p className="text-xl font-bold text-white">{cpuStats.active}/{cpuStats.total}</p>
              <div className="text-xs text-gray-400 mt-2">
                <p>Utilization: {Math.round((cpuStats.active / cpuStats.total) * 100)}%</p>
              </div>
            </div>
            
            {/* Mining Health Status */}
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 text-sm mb-1">Mining Health</p>
              <div className="text-xl font-bold">
                {renderHealthStatus()}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                <p>Last check: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            
            {/* Hashrate */}
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 text-sm mb-1">Live Hashrate</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl font-bold text-white">{hashrate}</p>
                <span className="text-gray-400">GH/s</span>
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center">
                <BarChart2 className="w-3 h-3 mr-1" />
                <p>24h: +3.2%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <EncryptionTerminal 
        gpuCount={gpuStats.rtx5090.total + gpuStats.rtx4090.total}
        cpuCount={cpuStats.total}
      />
    </div>
  );
};

export default SystemOverviewHeader;
