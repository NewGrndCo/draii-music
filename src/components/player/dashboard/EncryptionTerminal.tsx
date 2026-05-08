import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Terminal, Cpu, MonitorSmartphone, ArrowRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EncryptionTerminalProps {
  gpuCount: number;
  cpuCount: number;
}

interface MiningOperation {
  id: string;
  deviceType: 'GPU' | 'CPU';
  deviceId: number;
  model: string;
  blockId: string;
  hash: string;
  nonce: number;
  difficulty: number;
  time: number;
  status: 'processing' | 'accepted' | 'rejected';
  hashrate: number;
  load: number;
  temperature: number;
}

interface MetricStats {
  avgHashrate: number;
  avgLoad: {
    gpu: number;
    cpu: number;
  };
  avgTemp: {
    gpu: number;
    cpu: number;
  };
  totalBlocksToday: number;
  peakHashrate: number;
}

const EncryptionTerminal: React.FC<EncryptionTerminalProps> = ({ gpuCount, cpuCount }) => {
  const [operations, setOperations] = useState<MiningOperation[]>([]);
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'gpu' | 'cpu'>('all');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [blocksToday, setBlocksToday] = useState<number>(0);
  const [avgHashRate, setAvgHashRate] = useState<number>(238.6);
  const [showGlitch, setShowGlitch] = useState<boolean>(false);
  const [liveMetrics, setLiveMetrics] = useState<MetricStats>({
    avgHashrate: 238.6,
    avgLoad: {
      gpu: 78,
      cpu: 62
    },
    avgTemp: {
      gpu: 72,
      cpu: 65
    },
    totalBlocksToday: 0,
    peakHashrate: 256.3
  });
  const terminalRef = useRef<HTMLDivElement>(null);
  const maxOperations = viewMode === 'compact' ? 6 : 12;
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  const [konamiIndex, setKonamiIndex] = useState<number>(0);
  const [terminalTheme, setTerminalTheme] = useState<'default' | 'inverted'>('default');

  // Generate realistic block IDs, nonces, and difficulties
  const generateRandomBlockId = () => {
    const chars = '0123456789ABCDEF';
    return Array(6).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const generateHash = () => {
    const chars = '0123456789abcdef';
    return '0000000000000000000' + Array(45).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const generateNonce = () => Math.floor(Math.random() * 10000000);
  
  const generateDifficulty = () => (Math.random() * 10 + 12).toFixed(2);

  const generateRandomTime = () => (Math.random() * 0.8 + 0.2).toFixed(3);
  
  const generateHashrate = (deviceType: 'GPU' | 'CPU', model: string) => {
    // Generate hashrate based on device type and model
    if (deviceType === 'GPU') {
      if (model.includes('5090')) {
        return (Math.random() * 4 + 12).toFixed(1);
      } else {
        return (Math.random() * 3 + 9).toFixed(1);
      }
    } else {
      return (Math.random() * 1 + 2).toFixed(1);
    }
  };
  
  const generateLoad = (deviceType: 'GPU' | 'CPU') => {
    // Generate load percentage based on device type
    if (deviceType === 'GPU') {
      return Math.floor(Math.random() * 30 + 70);
    } else {
      return Math.floor(Math.random() * 40 + 50);
    }
  };
  
  const generateTemperature = (deviceType: 'GPU' | 'CPU', load: number) => {
    // Generate temperature based on device type and load
    if (deviceType === 'GPU') {
      return Math.floor((load / 100) * 25 + 55); // 55-80 range based on load
    } else {
      return Math.floor((load / 100) * 15 + 50); // 50-65 range based on load
    }
  };

  // Generate a realistic mining operation
  const generateOperation = (): MiningOperation => {
    const deviceType = Math.random() > 0.3 ? 'GPU' : 'CPU';
    const deviceId = Math.floor(Math.random() * (deviceType === 'GPU' ? gpuCount : cpuCount)) + 1;
    const model = deviceType === 'GPU' 
      ? Math.random() > 0.5 ? 'RTX 5090' : 'RTX 4090'
      : 'Thread Node';
    
    const status = Math.random() > 0.05 ? 'accepted' : 'rejected';
    const load = generateLoad(deviceType);
    const temperature = generateTemperature(deviceType, load);
    const hashrate = parseFloat(generateHashrate(deviceType, model));
    
    return {
      id: crypto.randomUUID(),
      deviceType,
      deviceId,
      model,
      blockId: generateRandomBlockId(),
      hash: generateHash(),
      nonce: generateNonce(),
      difficulty: parseFloat(generateDifficulty()),
      time: parseFloat(generateRandomTime()),
      status: Math.random() > 0.9 ? 'processing' : status,
      hashrate,
      load,
      temperature
    };
  };
  
  // Update metrics in real-time
  const updateLiveMetrics = (newOperation: MiningOperation) => {
    setLiveMetrics(prev => {
      // Calculate new average hashrate with slight randomization
      const newHashrateBase = (prev.avgHashrate * 0.95) + (newOperation.hashrate * 0.05);
      const newHashrate = parseFloat((newHashrateBase + (Math.random() * 4 - 2)).toFixed(1));
      
      // Update device-specific metrics
      const isGPU = newOperation.deviceType === 'GPU';
      const newAvgLoad = {
        gpu: isGPU 
          ? Math.floor((prev.avgLoad.gpu * 0.9) + (newOperation.load * 0.1))
          : prev.avgLoad.gpu + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3),
        cpu: !isGPU 
          ? Math.floor((prev.avgLoad.cpu * 0.9) + (newOperation.load * 0.1))
          : prev.avgLoad.cpu + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)
      };
      
      // Keep load within reasonable bounds
      newAvgLoad.gpu = Math.max(60, Math.min(95, newAvgLoad.gpu));
      newAvgLoad.cpu = Math.max(40, Math.min(90, newAvgLoad.cpu));
      
      // Update temperatures based on loads
      const newAvgTemp = {
        gpu: Math.floor((prev.avgTemp.gpu * 0.9) + (generateTemperature('GPU', newAvgLoad.gpu) * 0.1)),
        cpu: Math.floor((prev.avgTemp.cpu * 0.9) + (generateTemperature('CPU', newAvgLoad.cpu) * 0.1))
      };
      
      // Update peak hashrate if needed
      const newPeakHashrate = newHashrate > prev.peakHashrate 
        ? parseFloat(newHashrate.toFixed(1)) 
        : prev.peakHashrate;
      
      return {
        avgHashrate: newHashrate,
        avgLoad: newAvgLoad,
        avgTemp: newAvgTemp,
        totalBlocksToday: prev.totalBlocksToday + (newOperation.status === 'accepted' ? 1 : 0),
        peakHashrate: newPeakHashrate
      };
    });
  };

  // Add a new operation to the terminal
  useEffect(() => {
    const interval = setInterval(() => {
      // Occasionally show glitch
      if (Math.random() > 0.95) {
        setShowGlitch(true);
        setTimeout(() => setShowGlitch(false), 800);
      }

      // Add new operation
      const newOperation = generateOperation();
      updateLiveMetrics(newOperation);
      
      // Update blocks today counter if block was accepted
      if (newOperation.status === 'accepted') {
        setBlocksToday(prev => prev + 1);
      }

      // Fluctuate average hash rate
      setAvgHashRate(prev => {
        const newRate = prev + (Math.random() * 2 - 1);
        return parseFloat(newRate.toFixed(1));
      });
      
      setOperations(prev => {
        const updated = [newOperation, ...prev];
        return updated.slice(0, maxOperations);
      });
    }, Math.random() * 500 + 800); // Random interval between 800ms and 1300ms

    return () => clearInterval(interval);
  }, [gpuCount, cpuCount, maxOperations]);

  // Auto scroll to the latest operation
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [operations]);

  // Handle Konami code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiSequence[konamiIndex]) {
        const nextIndex = konamiIndex + 1;
        setKonamiIndex(nextIndex);
        
        if (nextIndex === konamiSequence.length) {
          setTerminalTheme(prev => prev === 'default' ? 'inverted' : 'default');
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex]);

  // Filter operations based on user selection
  const filteredOperations = operations.filter(op => {
    if (deviceFilter !== 'all' && op.deviceType.toLowerCase() !== deviceFilter) {
      return false;
    }
    
    if (selectedDevice && `${op.deviceType} ${op.deviceId.toString().padStart(2, '0')}` !== selectedDevice) {
      return false;
    }
    
    return true;
  });
  
  // Function to get color for temperature visualization
  const getTemperatureColor = (temp: number, deviceType: 'GPU' | 'CPU') => {
    if (deviceType === 'GPU') {
      if (temp >= 80) return 'text-red-400';
      if (temp >= 70) return 'text-yellow-400';
      return 'text-green-400';
    } else {
      if (temp >= 70) return 'text-red-400';
      if (temp >= 60) return 'text-yellow-400';
      return 'text-green-400';
    }
  };

  // Render the terminal
  return (
    <Card className="bg-black/30 border-0">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className={cn(
              "w-5 h-5",
              terminalTheme === 'default' ? "text-green-400" : "text-purple-400"
            )} />
            <h3 className="text-lg md:text-xl font-medium text-white">Mining Terminal</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setDeviceFilter('all')}
              className={cn(
                "text-xs p-1 rounded transition-colors",
                deviceFilter === 'all' ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
              )}
            >
              All
            </button>
            <button 
              onClick={() => setDeviceFilter('gpu')}
              className={cn(
                "text-xs p-1 rounded transition-colors flex items-center",
                deviceFilter === 'gpu' ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <MonitorSmartphone className="w-3 h-3 mr-1" /> GPU
            </button>
            <button 
              onClick={() => setDeviceFilter('cpu')}
              className={cn(
                "text-xs p-1 rounded transition-colors flex items-center",
                deviceFilter === 'cpu' ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
              )}
            >
              <Cpu className="w-3 h-3 mr-1" /> CPU
            </button>
            <button 
              onClick={() => setViewMode(prev => prev === 'full' ? 'compact' : 'full')}
              className="text-xs p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {viewMode === 'full' ? 'Compact' : 'Full'}
            </button>
          </div>
        </div>
        
        {viewMode === 'full' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 bg-black/20 p-2 rounded-t-lg text-xs">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-semibold">{liveMetrics.totalBlocksToday}</span>
                <span className="text-gray-400">Blocks today</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${(liveMetrics.totalBlocksToday % 10) * 10}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-semibold">{liveMetrics.avgHashrate.toFixed(1)} TH/s</span>
                <span className="text-gray-400">Avg. rate</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${(liveMetrics.avgHashrate / liveMetrics.peakHashrate) * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={getTemperatureColor(liveMetrics.avgTemp.gpu, 'GPU')}>{liveMetrics.avgTemp.gpu}°C</span>
                  <span className="text-gray-400">GPU Temp</span>
                </div>
                <span className="text-gray-400">{liveMetrics.avgLoad.gpu}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className={cn(
                    "h-1.5 rounded-full",
                    liveMetrics.avgLoad.gpu > 90 ? "bg-red-500" :
                    liveMetrics.avgLoad.gpu > 80 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${liveMetrics.avgLoad.gpu}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={getTemperatureColor(liveMetrics.avgTemp.cpu, 'CPU')}>{liveMetrics.avgTemp.cpu}°C</span>
                  <span className="text-gray-400">CPU Temp</span>
                </div>
                <span className="text-gray-400">{liveMetrics.avgLoad.cpu}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className={cn(
                    "h-1.5 rounded-full",
                    liveMetrics.avgLoad.cpu > 80 ? "bg-red-500" :
                    liveMetrics.avgLoad.cpu > 70 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${liveMetrics.avgLoad.cpu}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={terminalRef}
          className={cn(
            "bg-black/50 rounded-lg p-4 font-mono text-sm h-[240px] overflow-hidden",
            viewMode === 'full' ? "rounded-t-none" : "",
            terminalTheme === 'default' ? "" : "bg-white/10"
          )}
        >
          <AnimatePresence>
            {showGlitch && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-400 mb-2 animate-pulse"
              >
                [SYSTEM] Reinitializing GPU Node... Error #4F392A detected
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-2">
            {filteredOperations.map((op, index) => (
              <AnimatePresence key={op.id}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                  className={cn(
                    terminalTheme === 'default'
                      ? op.deviceType === 'GPU' ? "text-green-400" : "text-cyan-400"
                      : op.deviceType === 'GPU' ? "text-purple-400" : "text-pink-400",
                    "mb-2 font-mono text-xs md:text-sm"
                  )}
                >
                  <div className="flex flex-wrap items-start">
                    <span className="font-semibold">
                      [{op.deviceType} {op.deviceId.toString().padStart(2, '0')} - {op.model}]
                    </span>
                    <div className="flex flex-wrap items-center ml-1">
                      <ArrowRight className="h-3 w-3 inline mx-1" /> 
                      {op.status === 'processing' ? (
                        <span className="animate-pulse">Decrypting block #{op.blockId}...</span>
                      ) : (
                        <span>Solved block #{op.blockId}</span>
                      )}
                      <span className="ml-1 text-xs opacity-70">
                        ({op.hashrate} GH/s | {op.load}% | {op.temperature}°C)
                      </span>
                    </div>
                  </div>
                  
                  {(op.status !== 'processing' || index === 0) && (
                    <>
                      <div className="ml-6 text-opacity-90 flex flex-wrap">
                        <ArrowRight className="h-3 w-3 inline mr-1 opacity-60" /> 
                        <span className="font-light">Hash: </span>
                        <span className="ml-1 font-light opacity-80">{op.hash}</span>
                      </div>
                      
                      {viewMode === 'full' && (
                        <div className="ml-6 text-opacity-80 flex flex-wrap">
                          <ArrowRight className="h-3 w-3 inline mr-1 opacity-60" /> 
                          <span className="font-light">Nonce: {op.nonce} | Difficulty: {op.difficulty} TH</span>
                        </div>
                      )}
                      
                      <div className="ml-6 flex items-center">
                        {op.status === 'accepted' ? (
                          <>
                            <Check className="h-3 w-3 inline mr-1 text-green-500" /> 
                            <span>Block accepted | Time: {op.time}s</span>
                          </>
                        ) : op.status === 'rejected' ? (
                          <>
                            <X className="h-3 w-3 inline mr-1 text-red-500" /> 
                            <span>Block rejected | Error: Invalid merkle root</span>
                          </>
                        ) : (
                          <span className="animate-pulse">Processing...</span>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
          
          <div className="h-4 relative">
            <div className="absolute bottom-0 left-0 w-2 h-4 bg-green-500 animate-pulse opacity-70"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EncryptionTerminal;
