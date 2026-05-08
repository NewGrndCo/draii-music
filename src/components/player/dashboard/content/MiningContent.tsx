
import React from 'react';
import { GPU, CpuGroup, SystemLog } from '../../types/dashboard';
import SystemOverviewHeader from '../SystemOverviewHeader';
import GpuStatusGrid from '../GpuStatusGrid';
import CpuNodeOverview from '../CpuNodeOverview';
import SystemControls from '../SystemControls';
import LogsAndErrors from '../LogsAndErrors';

interface MiningContentProps {
  gpus: GPU[];
  gpuStats: {
    rtx5090: { total: number; online: number };
    rtx4090: { total: number; online: number };
  };
  cpuStats: {
    total: number;
    active: number;
  };
  cpuGroups: CpuGroup[];
  logs: SystemLog[];
  systemHealth: 'optimal' | 'degraded' | 'failure';
  liveHashrate: number;
  powerUsage: number;
  balancedMode: boolean;
  emergencyMode: boolean;
  topPerformingGroups: string[];
  onGpuAction: (gpuId: string, action: 'restart' | 'pause' | 'remove' | 'toggle-mode') => void;
  onCpuGroupAction: (groupId: string, action: 'pause' | 'reboot' | 'toggle-mining' | 'toggle-thermal') => void;
  onSystemAction: (action: 'restart-gpus' | 'restart-cpus' | 'toggle-balanced' | 'toggle-emergency') => void;
  onExportLogs: () => void;
  onReportIssue: () => void;
}

const MiningContent: React.FC<MiningContentProps> = ({
  gpus,
  gpuStats,
  cpuStats,
  cpuGroups,
  logs,
  systemHealth,
  liveHashrate,
  powerUsage,
  balancedMode,
  emergencyMode,
  topPerformingGroups,
  onGpuAction,
  onCpuGroupAction,
  onSystemAction,
  onExportLogs,
  onReportIssue
}) => {
  return (
    <div className="space-y-6">
      <SystemOverviewHeader 
        gpuStats={gpuStats}
        cpuStats={cpuStats}
        healthStatus={systemHealth}
        hashrate={liveHashrate}
      />
      
      <GpuStatusGrid 
        gpus={gpus}
        onGpuAction={onGpuAction}
      />
      
      <CpuNodeOverview 
        cpuGroups={cpuGroups}
        onCpuGroupAction={onCpuGroupAction}
        topPerformingGroups={topPerformingGroups}
      />
      
      <SystemControls 
        powerUsage={powerUsage}
        balancedMode={balancedMode}
        emergencyMode={emergencyMode}
        onSystemAction={onSystemAction}
      />
      
      <LogsAndErrors 
        logs={logs}
        onExportLogs={onExportLogs}
        onReportIssue={onReportIssue}
      />
    </div>
  );
};

export default MiningContent;
