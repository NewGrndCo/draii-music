
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Settings, AlertTriangle, Power } from 'lucide-react';

interface SystemControlsProps {
  powerUsage: number;
  balancedMode: boolean;
  emergencyMode: boolean;
  onSystemAction: (action: 'restart-gpus' | 'restart-cpus' | 'toggle-balanced' | 'toggle-emergency') => void;
}

const SystemControls: React.FC<SystemControlsProps> = ({ 
  powerUsage,
  balancedMode,
  emergencyMode,
  onSystemAction
}) => {
  return (
    <Card className="bg-black/30 border-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-medium text-white">System-Wide Controls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Button 
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 h-10"
              onClick={() => onSystemAction('restart-gpus')}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restart All GPUs</span>
            </Button>
            
            <Button 
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 h-10"
              onClick={() => onSystemAction('restart-cpus')}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restart All CPUs</span>
            </Button>
            
            <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Power className="w-4 h-4 text-gray-300" />
                <div>
                  <p className="text-sm text-white">Power Usage</p>
                  <p className="text-xs text-gray-400">Entire mining system</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{powerUsage} kW</p>
                <p className="text-xs text-gray-400">real-time</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Balanced Load Mode</p>
                <p className="text-xs text-gray-400">Auto-adjust GPU/CPU resources</p>
              </div>
              <Switch 
                checked={balancedMode}
                onCheckedChange={() => onSystemAction('toggle-balanced')}
              />
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">Emergency Mode</p>
                  <p className="text-xs text-gray-400">Throttle all devices if overheating</p>
                </div>
              </div>
              <Switch 
                checked={emergencyMode}
                onCheckedChange={() => onSystemAction('toggle-emergency')}
              />
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-400 text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                <p>System Health Notes</p>
              </div>
              <p className="text-xs text-gray-300">
                Auto-throttling is active on 3 GPUs due to temperature thresholds. Consider adjusting cooling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemControls;
