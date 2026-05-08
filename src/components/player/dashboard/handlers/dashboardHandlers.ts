
import { toast } from 'sonner';
import { Song } from '../../../../data/musicData';
import { GPU, CpuGroup } from '../types/dashboard';

// Song handling
export const handleSelectSong = (song: Song) => {
  console.log('Selected song:', song);
  // This could be updated to play the song or perform another action
};

// Hardware resource assignment handler
export const handleResourceAssignment = (type: 'gpu' | 'cpu', count: number) => {
  console.log(`Assigned ${count} ${type}s to boosted songs`);
  // Here you would implement the actual resource assignment logic
  toast.success(`${count} ${type.toUpperCase()}s dedicated to boosted songs`);
};

// GPU action handler factory
export const createGpuActionHandler = (
  gpus: GPU[], 
  setGpus: (gpus: GPU[]) => void
) => (gpuId: string, action: 'restart' | 'pause' | 'remove' | 'toggle-mode') => {
  // Find the GPU in the array
  const gpuIndex = gpus.findIndex(gpu => gpu.id === gpuId);
  if (gpuIndex === -1) return;
  
  // Create a copy of the GPUs array
  const updatedGpus = [...gpus];
  
  switch (action) {
    case 'restart':
      toast.success(`Restarting GPU #${updatedGpus[gpuIndex].slot}`);
      // In a real system, you would initiate a restart and then update the state once complete
      break;
    case 'pause':
      toast.success(`Paused GPU #${updatedGpus[gpuIndex].slot}`);
      updatedGpus[gpuIndex] = {
        ...updatedGpus[gpuIndex],
        status: updatedGpus[gpuIndex].status === 'online' ? 'offline' : 'online'
      };
      break;
    case 'remove':
      toast.warning(`Removed GPU #${updatedGpus[gpuIndex].slot} from mining pool`);
      updatedGpus[gpuIndex] = {
        ...updatedGpus[gpuIndex],
        status: 'offline',
        load: 0,
        hashrate: 0
      };
      break;
    case 'toggle-mode':
      updatedGpus[gpuIndex] = {
        ...updatedGpus[gpuIndex],
        highPerformanceMode: !updatedGpus[gpuIndex].highPerformanceMode
      };
      toast.success(`${updatedGpus[gpuIndex].highPerformanceMode ? 'Enabled' : 'Disabled'} high performance mode for GPU #${updatedGpus[gpuIndex].slot}`);
      break;
  }
  
  setGpus(updatedGpus);
};

// CPU group action handler factory
export const createCpuGroupActionHandler = (
  cpuGroups: CpuGroup[], 
  setCpuGroups: (groups: CpuGroup[]) => void
) => (groupId: string, action: 'pause' | 'reboot' | 'toggle-mining' | 'toggle-thermal') => {
  // Find the CPU group in the array
  const groupIndex = cpuGroups.findIndex(group => group.id === groupId);
  if (groupIndex === -1) return;
  
  // Create a copy of the CPU groups array
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
      // In a real system, you would initiate a reboot and then update the state once complete
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

// System-wide control action handler factory
export const createSystemActionHandler = (
  balancedMode: boolean,
  setBalancedMode: (mode: boolean) => void,
  emergencyMode: boolean,
  setEmergencyMode: (mode: boolean) => void
) => (action: 'restart-gpus' | 'restart-cpus' | 'toggle-balanced' | 'toggle-emergency') => {
  switch (action) {
    case 'restart-gpus':
      toast.success('Restarting all GPUs');
      // In a real system, you would initiate a system-wide GPU restart
      break;
    case 'restart-cpus':
      toast.success('Restarting all CPUs');
      // In a real system, you would initiate a system-wide CPU restart
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

// Log export handler
export const handleExportLogs = () => {
  toast.success('Exporting logs...');
  // In a real system, you would generate and download a log file
  setTimeout(() => {
    toast.success('Logs exported successfully');
  }, 1500);
};

// Report issue handler
export const handleReportIssue = () => {
  toast.success('Sending report to support team...');
  // In a real system, you would open a modal or form for reporting issues
  setTimeout(() => {
    toast.success('Report sent to support team');
  }, 1500);
};
