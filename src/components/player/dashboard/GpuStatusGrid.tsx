
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Pause, X, ChevronLeft, ChevronRight, Layers, Thermometer } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GPU, GpuStatus } from '../types/dashboard';

interface GPUStatusGridProps {
  gpus: GPU[];
  onGpuAction: (gpuId: string, action: 'restart' | 'pause' | 'remove' | 'toggle-mode') => void;
}

const AnimatedValue = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const motionValue = useMotionValue(value);

  React.useEffect(() => {
    const controls = animate(motionValue, value, {
      type: "tween",
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
      repeatDelay: 0.5,
    });

    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{motionValue.get().toFixed(1)}{suffix}</motion.span>;
};

// Function to get color based on temperature
const getTempColor = (temp: number) => {
  if (temp >= 80) return 'text-red-400';
  if (temp >= 70) return 'text-yellow-400';
  return 'text-green-400';
};

// Function to get status color
const getStatusColor = (status: GpuStatus) => {
  switch (status) {
    case 'online': return 'text-green-400';
    case 'offline': return 'text-gray-400';
    case 'error': return 'text-red-400';
  }
};

const GPUStatusGrid: React.FC<GPUStatusGridProps> = ({ gpus, onGpuAction }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [simulatedGpus, setSimulatedGpus] = useState(gpus);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(gpus.length / itemsPerPage);

  // Enhanced simulation with more realistic hashrate variations
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedGpus(prevGpus => prevGpus.map(gpu => {
        if (gpu.status === 'online') {
          // Base hashrate varies by GPU model
          const baseHashrate = gpu.model === 'RTX 5090' ? 14 : 11;
          
          // Calculate variations with more realistic patterns
          const timeBasedVariation = Math.sin(Date.now() / 10000) * 0.5; // Slow oscillation
          const randomVariation = (Math.random() * 0.4 - 0.2); // Small random fluctuations
          const loadImpact = ((gpu.load - 75) / 100) * 0.5; // Load affects hashrate
          const tempImpact = gpu.temperature > 80 ? -0.8 : gpu.temperature > 70 ? -0.3 : 0; // Temperature penalty
          
          // Combined hashrate calculation
          const newHashrate = baseHashrate + timeBasedVariation + randomVariation + loadImpact + tempImpact;
          
          // Update other metrics as well
          const loadVariation = Math.random() * 10 - 5;
          const tempVariation = Math.random() * 4 - 2;

          return {
            ...gpu,
            load: Math.max(60, Math.min(95, gpu.load + loadVariation)),
            temperature: Math.max(55, Math.min(85, gpu.temperature + tempVariation)),
            hashrate: Math.max(8, Math.min(15, newHashrate))
          };
        }
        return gpu;
      }));
    }, 1000); // Update every second for smoother animation

    return () => clearInterval(interval);
  }, []);

  const currentGpus = simulatedGpus.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Card className="bg-black/30 border-0">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-medium text-white">GPU Status</h3>
            <span className="text-sm text-gray-400">
              Group {currentPage + 1} of {totalPages}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="h-6 w-px bg-gray-700 mx-2" />
            <Button 
              size="sm" 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              Grid
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              List
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentGpus.map(gpu => (
              <div 
                key={gpu.id}
                className={`bg-white/5 p-4 rounded-lg ${
                  gpu.status === 'error' ? 'border border-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className={`font-medium ${getStatusColor(gpu.status)}`}>
                      {gpu.model} • Slot {gpu.slot}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">#{gpu.id.substring(0, 8)}</span>
                  </div>
                  <span className={`${getTempColor(gpu.temperature)} font-medium`}>
                    <AnimatedValue value={gpu.temperature} suffix="°C" />
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Load</span>
                    <span className="text-xs text-gray-400">
                      <AnimatedValue value={gpu.load} suffix="%" />
                    </span>
                  </div>
                  <Progress
                    value={gpu.load}
                    className="h-2 bg-gray-700"
                    indicatorClassName={
                      gpu.load > 90 ? 'bg-red-500' : 
                      gpu.load > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block">Hashrate</span>
                    <span className="text-white">
                      <AnimatedValue value={gpu.hashrate} suffix=" GH/s" />
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Uptime</span>
                    <span className="text-white">{gpu.uptime}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Status</span>
                    <span className={getStatusColor(gpu.status)}>
                      {gpu.status.charAt(0).toUpperCase() + gpu.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Last Boot</span>
                    <span className="text-white">{gpu.lastBoot}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    className="flex items-center justify-center space-x-1 h-8"
                    onClick={() => onGpuAction(gpu.id, 'restart')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restart</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="flex items-center justify-center space-x-1 h-8"
                    onClick={() => onGpuAction(gpu.id, 'pause')}
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex items-center justify-center space-x-1 h-8"
                    onClick={() => onGpuAction(gpu.id, 'remove')}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </Button>
                  <div className="flex items-center justify-between px-3 h-8 bg-white/10 rounded-md">
                    <span className="text-xs text-gray-300">Performance</span>
                    <Switch 
                      checked={gpu.highPerformanceMode}
                      onCheckedChange={() => onGpuAction(gpu.id, 'toggle-mode')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-black/30">
                <TableRow>
                  <TableHead className="text-gray-400">ID/Slot</TableHead>
                  <TableHead className="text-gray-400">Model</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Load</TableHead>
                  <TableHead className="text-gray-400">Temp</TableHead>
                  <TableHead className="text-gray-400">Hashrate</TableHead>
                  <TableHead className="text-gray-400">Uptime</TableHead>
                  <TableHead className="text-gray-400">Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGpus.map(gpu => (
                  <TableRow key={gpu.id} className="border-b border-white/10">
                    <TableCell className="text-white">
                      <div>Slot {gpu.slot}</div>
                      <div className="text-xs text-gray-400">#{gpu.id.substring(0, 8)}</div>
                    </TableCell>
                    <TableCell className="font-medium text-white">{gpu.model}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(gpu.status)}>
                        {gpu.status.charAt(0).toUpperCase() + gpu.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={gpu.load}
                          className="w-16 h-2 bg-gray-700"
                          indicatorClassName={
                            gpu.load > 90 ? 'bg-red-500' : 
                            gpu.load > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }
                        />
                        <span className="text-white"><AnimatedValue value={gpu.load} suffix="%" /></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`${getTempColor(gpu.temperature)} flex items-center`}>
                        <Thermometer className="w-3.5 h-3.5 mr-1" />
                        <AnimatedValue value={gpu.temperature} suffix="°C" />
                      </span>
                    </TableCell>
                    <TableCell className="text-white"><AnimatedValue value={gpu.hashrate} suffix=" GH/s" /></TableCell>
                    <TableCell className="text-white">{gpu.uptime}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          title="Restart"
                          onClick={() => onGpuAction(gpu.id, 'restart')}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          title="Pause"
                          onClick={() => onGpuAction(gpu.id, 'pause')}
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          title="Remove from pool"
                          onClick={() => onGpuAction(gpu.id, 'remove')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                        <Switch 
                          checked={gpu.highPerformanceMode} 
                          onCheckedChange={() => onGpuAction(gpu.id, 'toggle-mode')}
                          className="ml-1"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GPUStatusGrid;
