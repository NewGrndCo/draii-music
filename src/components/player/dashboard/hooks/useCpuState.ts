
import { useState } from 'react';
import { CpuGroup } from '../types/dashboard';
import { toast } from 'sonner';

export function useCpuState() {
  const [cpuGroups, setCpuGroups] = useState<CpuGroup[]>([
    {
      id: 'cpu-group-1',
      name: 'US-East Cluster',
      totalNodes: 320,
      activeNodes: 298,
      avgLoad: 72,
      avgHashrate: 3.2,
      lastSync: '2min ago',
      isEnabled: true,
      thermalProtection: true
    },
    {
      id: 'cpu-group-2',
      name: 'US-West Cluster',
      totalNodes: 285,
      activeNodes: 267,
      avgLoad: 68,
      avgHashrate: 2.9,
      lastSync: '3min ago',
      isEnabled: true,
      thermalProtection: true
    },
    {
      id: 'cpu-group-3',
      name: 'EU-West Cluster',
      totalNodes: 210,
      activeNodes: 195,
      avgLoad: 84,
      avgHashrate: 3.6,
      lastSync: '6min ago',
      isEnabled: true,
      thermalProtection: true
    },
    {
      id: 'cpu-group-4',
      name: 'Asia-Pacific Cluster',
      totalNodes: 150,
      activeNodes: 132,
      avgLoad: 62,
      avgHashrate: 2.7,
      lastSync: '12min ago',
      isEnabled: true,
      thermalProtection: false
    }
  ]);
  
  const cpuStats = {
    total: 965,
    active: 892
  };
  
  const topPerformingGroups = [
    'cpu-group-3', 'cpu-group-1', 'cpu-group-2', 'cpu-group-4'
  ];

  const handleCpuGroupAction = (groupId: string, action: 'pause' | 'reboot' | 'toggle-mining' | 'toggle-thermal') => {
    const groupIndex = cpuGroups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) return;
    
    const updatedGroups = [...cpuGroups];
    
    switch (action) {
      case 'pause':
        toast.success(`Paused ${updatedGroups[groupIndex].name}`);
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          activeNodes: 0,
          avgLoad: 0,
          avgHashrate: 0
        };
        break;
      case 'reboot':
        toast.success(`Rebooting ${updatedGroups[groupIndex].name}`);
        break;
      case 'toggle-mining':
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          isEnabled: !updatedGroups[groupIndex].isEnabled,
          activeNodes: updatedGroups[groupIndex].isEnabled ? 0 : updatedGroups[groupIndex].totalNodes - Math.floor(Math.random() * 30)
        };
        toast.success(`${updatedGroups[groupIndex].isEnabled ? 'Enabled' : 'Disabled'} mining for ${updatedGroups[groupIndex].name}`);
        break;
      case 'toggle-thermal':
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          thermalProtection: !updatedGroups[groupIndex].thermalProtection
        };
        toast.success(`${updatedGroups[groupIndex].thermalProtection ? 'Enabled' : 'Disabled'} thermal protection for ${updatedGroups[groupIndex].name}`);
        break;
    }
    
    setCpuGroups(updatedGroups);
  };

  return {
    cpuGroups,
    cpuStats,
    topPerformingGroups,
    handleCpuGroupAction
  };
}
