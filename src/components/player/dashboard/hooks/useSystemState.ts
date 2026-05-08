
import { useState } from 'react';
import { SystemLog } from '../types/dashboard';
import { toast } from 'sonner';

export function useSystemState() {
  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: 'log-1',
      type: 'overheat',
      deviceId: '5a6b7c8d9e0f1g2h',
      deviceType: 'gpu',
      message: 'GPU temperature exceeded critical threshold (84°C)',
      timestamp: '2025-04-22 19:17:32',
      severity: 'high'
    },
    {
      id: 'log-2',
      type: 'shutdown',
      deviceId: '6a7b8c9d0e1f2g3h',
      deviceType: 'gpu',
      message: 'Unexpected shutdown during mining operation',
      timestamp: '2025-04-22 14:23:08',
      severity: 'medium'
    },
    {
      id: 'log-3',
      type: 'error',
      deviceId: 'cpu-group-3',
      deviceType: 'cpu',
      message: '15 nodes disconnected due to network latency issues',
      timestamp: '2025-04-22 16:42:19',
      severity: 'medium'
    },
    {
      id: 'log-4',
      type: 'info',
      deviceId: 'system',
      deviceType: 'cpu',
      message: 'Auto-throttling applied to US-East cluster due to high temperature',
      timestamp: '2025-04-22 18:03:54',
      severity: 'low'
    },
    {
      id: 'log-5',
      type: 'overheat',
      deviceId: '2a3b4c5d6e7f8g9h',
      deviceType: 'gpu',
      message: 'Temperature threshold warning (68°C)',
      timestamp: '2025-04-22 19:05:21',
      severity: 'low'
    }
  ]);

  const [balancedMode, setBalancedMode] = useState<boolean>(true);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [powerUsage, setPowerUsage] = useState<number>(142.37);
  const [systemHealth, setSystemHealth] = useState<'optimal' | 'degraded' | 'failure'>('optimal');
  const [liveHashrate, setLiveHashrate] = useState<number>(245);

  const handleSystemAction = (action: 'restart-gpus' | 'restart-cpus' | 'toggle-balanced' | 'toggle-emergency') => {
    switch (action) {
      case 'restart-gpus':
        toast.success('Restarting all GPUs');
        break;
      case 'restart-cpus':
        toast.success('Restarting all CPUs');
        break;
      case 'toggle-balanced':
        setBalancedMode(!balancedMode);
        toast.success(`${!balancedMode ? 'Enabled' : 'Disabled'} balanced load mode`);
        break;
      case 'toggle-emergency':
        setEmergencyMode(!emergencyMode);
        toast.success(`${!emergencyMode ? 'Enabled' : 'Disabled'} emergency mode`);
        break;
    }
  };
  
  const handleExportLogs = () => {
    toast.success('Exporting logs...');
    setTimeout(() => {
      toast.success('Logs exported successfully');
    }, 1500);
  };
  
  const handleReportIssue = () => {
    toast.success('Sending report to support team...');
    setTimeout(() => {
      toast.success('Report sent to support team');
    }, 1500);
  };

  return {
    logs,
    balancedMode,
    emergencyMode,
    powerUsage,
    systemHealth,
    liveHashrate,
    handleSystemAction,
    handleExportLogs,
    handleReportIssue
  };
}
