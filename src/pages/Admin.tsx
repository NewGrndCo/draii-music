
import React, { useState } from 'react';
import { useDashboardState } from '../components/player/dashboard/hooks/useDashboardState';
import { useLogState } from '../components/player/dashboard/hooks/useLogState';
import { useSongState } from '../components/player/dashboard/hooks/useSongState';
import DashboardHeader from '../components/player/dashboard/DashboardHeader';
import DashboardSidebar from '../components/player/dashboard/DashboardSidebar';
import { menuItems } from '../components/player/dashboard/menuItems';
import { useNavigate } from 'react-router-dom';

// Import dashboard content components
import DashboardContent from '../components/player/dashboard/content/DashboardContent';
import MiningContent from '../components/player/dashboard/content/MiningContent';
import AnalyticsContent from '../components/player/dashboard/content/AnalyticsContent';
import LibraryContent from '../components/player/dashboard/content/LibraryContent';
import ContractsContent from '../components/player/dashboard/content/ContractsContent';
import ListenersContent from '../components/player/dashboard/content/ListenersContent';
import WalletContent from '../components/player/dashboard/content/WalletContent';
import SettingsContent from '../components/player/dashboard/content/SettingsContent';
import NotificationsContent from '../components/player/dashboard/content/NotificationsContent';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const navigate = useNavigate();
  
  // Call all hooks unconditionally and in the same order every time
  const dashboardState = useDashboardState();
  const logState = useLogState();
  const songState = useSongState(true);
  
  // Destructure after all hooks are called
  const { songs, loading, handleSelectSong } = songState;
  const { logs, handleExportLogs, handleReportIssue } = logState;
  const { 
    gpus, gpuStats, cpuGroups, cpuStats, 
    topPerformingGroups, liveHashrate, 
    powerUsage, systemHealth, 
    balancedMode, emergencyMode,
    handleGpuAction, handleCpuGroupAction, handleSystemAction
  } = dashboardState;
  
  return (
    <div className="min-h-screen flex w-full bg-black text-white relative overflow-hidden">
      {/* Enhanced background gradient effects with better contrast */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black"></div>
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-purple-500/8 blur-3xl"></div>
        <div className="absolute bottom-[30%] right-[15%] w-80 h-80 rounded-full bg-blue-500/8 blur-3xl"></div>
      </div>

      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems}
      />

      <div className="flex-1 overflow-y-auto backdrop-blur-sm">
        <DashboardHeader 
          activeTab={activeTab}
          menuItems={menuItems}
          onClose={() => navigate('/')}
        />

        <div className="p-3 md:p-6 pb-20 space-y-6 md:space-y-8">
          {activeTab === 'dashboard' && <DashboardContent songs={songs} />}
          
          {activeTab === 'mining' && (
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
              onGpuAction={handleGpuAction}
              onCpuGroupAction={handleCpuGroupAction}
              onSystemAction={handleSystemAction}
              onExportLogs={handleExportLogs}
              onReportIssue={handleReportIssue}
            />
          )}
          
          {activeTab === 'analytics' && <AnalyticsContent songs={songs} />}
          
          {activeTab === 'library' && (
            <LibraryContent
              songs={songs}
              loading={loading}
              onSelectSong={handleSelectSong}
            />
          )}
          
          {activeTab === 'contracts' && <ContractsContent />}
          
          {activeTab === 'listeners' && <ListenersContent />}
          
          {activeTab === 'wallet' && <WalletContent />}
          
          {activeTab === 'settings' && <SettingsContent />}
          
          {activeTab === 'notifications' && <NotificationsContent />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
