
import { useGpuState } from './useGpuState';
import { useCpuState } from './useCpuState';
import { useSystemState } from './useSystemState';

export function useDashboardState() {
  const {
    gpus,
    gpuStats,
    handleGpuAction
  } = useGpuState();

  const {
    cpuGroups,
    cpuStats,
    topPerformingGroups,
    handleCpuGroupAction
  } = useCpuState();

  const {
    logs,
    balancedMode,
    emergencyMode,
    powerUsage,
    systemHealth,
    liveHashrate,
    handleSystemAction,
    handleExportLogs,
    handleReportIssue
  } = useSystemState();

  return {
    gpus,
    gpuStats,
    cpuGroups,
    cpuStats,
    logs,
    topPerformingGroups,
    balancedMode,
    emergencyMode,
    powerUsage,
    systemHealth,
    liveHashrate,
    handleGpuAction,
    handleCpuGroupAction,
    handleSystemAction,
    handleExportLogs,
    handleReportIssue
  };
}
