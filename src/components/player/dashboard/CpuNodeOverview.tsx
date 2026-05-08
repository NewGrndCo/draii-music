
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Cpu, RefreshCw, Pause, AlertTriangle } from 'lucide-react';

interface CPUGroup {
  id: string;
  name: string;
  totalNodes: number;
  activeNodes: number;
  avgLoad: number;
  avgHashrate: number;
  lastSync: string;
  isEnabled: boolean;
  thermalProtection: boolean;
}

interface CPUNodeOverviewProps {
  cpuGroups: CPUGroup[];
  onCpuGroupAction: (groupId: string, action: 'pause' | 'reboot' | 'toggle-mining' | 'toggle-thermal') => void;
  topPerformingGroups: string[];
}

const CPUNodeOverview: React.FC<CPUNodeOverviewProps> = ({ 
  cpuGroups, 
  onCpuGroupAction,
  topPerformingGroups
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (groupId: string) => {
    setExpanded(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  return (
    <Card className="bg-black/30 border-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-medium text-white">CPU Node Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 text-sm mb-1">Total Active CPUs</p>
            <p className="text-2xl font-bold text-white">
              {cpuGroups.reduce((acc, group) => acc + group.activeNodes, 0)}/
              {cpuGroups.reduce((acc, group) => acc + group.totalNodes, 0)}
            </p>
            <div className="text-xs text-gray-400 mt-2">
              <p>Active rate: {Math.round((cpuGroups.reduce((acc, group) => acc + group.activeNodes, 0) / 
                cpuGroups.reduce((acc, group) => acc + group.totalNodes, 0)) * 100)}%</p>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 text-sm mb-1">Load Balancing</p>
            <div className="flex space-x-1 mt-2">
              {cpuGroups.map(group => (
                <div 
                  key={group.id} 
                  className="h-5 rounded-sm" 
                  style={{ 
                    width: `${(group.totalNodes / cpuGroups.reduce((acc, g) => acc + g.totalNodes, 0)) * 100}%`,
                    backgroundColor: group.avgLoad > 90 ? '#ef4444' : 
                                     group.avgLoad > 75 ? '#f59e0b' : 
                                     group.avgLoad > 50 ? '#10b981' : '#4b5563'
                  }}
                  title={`${group.name}: ${group.avgLoad}% load`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              <p>Avg. load: {Math.round(cpuGroups.reduce((acc, group) => acc + (group.avgLoad * group.activeNodes), 0) / 
                cpuGroups.reduce((acc, group) => acc + group.activeNodes, 0))}%</p>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 text-sm mb-1">Top Performing Groups</p>
            <div className="space-y-1 mt-2">
              {topPerformingGroups.map(groupId => {
                const group = cpuGroups.find(g => g.id === groupId);
                if (!group) return null;
                return (
                  <div key={groupId} className="flex items-center justify-between">
                    <span className="text-xs text-white">{group.name}</span>
                    <span className="text-xs text-green-400">{group.avgHashrate} GH/s</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {cpuGroups.map(group => (
            <div key={group.id} className="bg-white/5 rounded-lg">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleExpand(group.id)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      group.avgLoad > 90 ? 'bg-red-500' : 
                      group.avgLoad > 75 ? 'bg-yellow-500' : 
                      group.isEnabled ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-white">{group.name}</h4>
                    <p className="text-xs text-gray-400">
                      {group.activeNodes}/{group.totalNodes} active nodes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{group.avgHashrate} GH/s</p>
                  <p className="text-xs text-gray-400">avg. hashrate</p>
                </div>
              </div>
              
              {expanded.includes(group.id) && (
                <div className="p-4 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">Load</span>
                        <span className="text-xs text-gray-400">{group.avgLoad}%</span>
                      </div>
                      <Progress
                        value={group.avgLoad}
                        className="h-2 bg-gray-700"
                        indicatorClassName={
                          group.avgLoad > 90 ? 'bg-red-500' : 
                          group.avgLoad > 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Last sync</span>
                      <span className="text-sm text-white">{group.lastSync}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="flex items-center justify-center space-x-1 h-8"
                      onClick={() => onCpuGroupAction(group.id, 'pause')}
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Group</span>
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex items-center justify-center space-x-1 h-8"
                      onClick={() => onCpuGroupAction(group.id, 'reboot')}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reboot Group</span>
                    </Button>
                    <div className="flex items-center justify-between px-3 h-8 bg-white/10 rounded-md">
                      <span className="text-xs text-gray-300">Mining</span>
                      <Switch 
                        checked={group.isEnabled}
                        onCheckedChange={() => onCpuGroupAction(group.id, 'toggle-mining')}
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 h-8 bg-white/10 rounded-md">
                      <div className="flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-300">Thermal</span>
                      </div>
                      <Switch 
                        checked={group.thermalProtection}
                        onCheckedChange={() => onCpuGroupAction(group.id, 'toggle-thermal')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CPUNodeOverview;
