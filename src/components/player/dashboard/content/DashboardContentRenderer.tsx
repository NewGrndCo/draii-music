
import React from 'react';
import { Song } from '../../../../data/musicData';
import { GPU, CpuGroup, SystemLog } from '../types/dashboard';

// Import dashboard content components
import DashboardContent from './DashboardContent';
import MiningContent from './MiningContent';
import AnalyticsContent from './AnalyticsContent';
import LibraryContent from './LibraryContent';
import ContractsContent from './ContractsContent';
import ListenersContent from './ListenersContent';
import WalletContent from './WalletContent';
import SettingsContent from './SettingsContent';
import NotificationsContent from './NotificationsContent';

interface DashboardContentRendererProps {
  activeTab: string;
  songs: Song[];
  loading: boolean;
  onSelectSong: (song: Song) => void;
  gpus: GPU[];
  gpuStats: { rtx5090: { total: number; online: number }; rtx4090: { total: number; online: number } };
  cpuStats: { total: number; active: number };
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

const DashboardContentRenderer: React.FC<DashboardContentRendererProps> = ({
  activeTab,
  songs,
  loading,
  onSelectSong,
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
  switch (activeTab) {
    case 'dashboard':
      return <DashboardContent songs={songs} />;
    
    case 'mining':
      return (
        <MiningContent
          gpus={gpus}
          gpuStats={gpuStats}
          cpuStats={cpuStats}
          cpuGroups={cpuGroups}
          logs={logs}
          systemHealth={systemHealth}
          liveHashrate={liveHashrate}
          powerUsage={powerUsage}
          balancedMode={balancedMode}
          emergencyMode={emergencyMode}
          topPerformingGroups={topPerformingGroups}
          onGpuAction={onGpuAction}
          onCpuGroupAction={onCpuGroupAction}
          onSystemAction={onSystemAction}
          onExportLogs={onExportLogs}
          onReportIssue={onReportIssue}
        />
      );
    
    case 'analytics':
      return <AnalyticsContent songs={songs} />;
    
    case 'library':
      return (
        <LibraryContent
          songs={songs}
          loading={loading}
          onSelectSong={onSelectSong}
        />
      );
    
    case 'contracts':
      return <ContractsContent />;
    
    case 'listeners':
      return <ListenersContent />;
    
    case 'wallet':
      return <WalletContent />;
    
    case 'settings':
      return <SettingsContent />;
    
    case 'notifications':
      return <NotificationsContent />;
    
    default:
      return <DashboardContent songs={songs} />;
  }
};

export default DashboardContentRenderer;
