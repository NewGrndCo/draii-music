
export type GpuModel = 'RTX 5090' | 'RTX 4090';
export type GpuStatus = 'online' | 'offline' | 'error';
export type LogSeverity = 'high' | 'medium' | 'low';
export type LogType = 'overheat' | 'shutdown' | 'error' | 'info';
export type DeviceType = 'gpu' | 'cpu';

export interface GPU {
  id: string;
  slot: number;
  model: GpuModel;
  status: GpuStatus;
  load: number;
  temperature: number;
  hashrate: number;
  uptime: string;
  lastBoot: string;
  highPerformanceMode: boolean;
}

export interface CpuGroup {
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

export interface SystemLog {
  id: string;
  type: LogType;
  deviceId: string;
  deviceType: DeviceType;
  message: string;
  timestamp: string;
  severity: LogSeverity;
}
