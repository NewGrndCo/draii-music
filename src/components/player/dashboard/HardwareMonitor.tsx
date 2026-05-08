
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Cpu, Layers } from 'lucide-react';

interface HardwareProps {
  onResourceAssign: (type: 'gpu' | 'cpu', count: number) => void;
}

const HardwareMonitor: React.FC<HardwareProps> = ({ onResourceAssign }) => {
  const [dedicatedGPUs, setDedicatedGPUs] = useState(0);
  const [dedicatedCPUs, setDedicatedCPUs] = useState(0);

  const gpus = [
    { id: 1, name: 'RTX 5090', load: 82, temp: 72 },
    { id: 2, name: 'RTX 5090', load: 78, temp: 68 },
    { id: 3, name: 'RTX 4090', load: 85, temp: 75 },
    { id: 4, name: 'RTX 4090', load: 76, temp: 70 }
  ];

  const cpus = [
    { id: 1, name: 'Thread 1', load: 67, temp: 65 },
    { id: 2, name: 'Thread 2', load: 72, temp: 68 },
    { id: 3, name: 'Thread 3', load: 58, temp: 62 },
    { id: 4, name: 'Thread 4', load: 81, temp: 71 }
  ];

  const handleGPUAssignment = (value: string) => {
    const count = parseInt(value);
    setDedicatedGPUs(count);
    onResourceAssign('gpu', count);
  };

  const handleCPUAssignment = (value: string) => {
    const count = parseInt(value);
    setDedicatedCPUs(count);
    onResourceAssign('cpu', count);
  };

  return (
    <div className="space-y-6">
      {/* GPUs Section */}
      <Card className="bg-black/30 p-6 border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-medium text-white">GPU Resources</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Dedicate for Boosted Songs:</span>
            <RadioGroup
              value={dedicatedGPUs.toString()}
              onValueChange={handleGPUAssignment}
              className="flex space-x-2"
            >
              {[0, 1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center space-x-1">
                  <RadioGroupItem
                    value={num.toString()}
                    id={`gpu-${num}`}
                    className="text-purple-400"
                  />
                  <label
                    htmlFor={`gpu-${num}`}
                    className="text-sm text-gray-300"
                  >
                    {num}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {gpus.map((gpu, index) => (
            <div
              key={gpu.id}
              className={`bg-white/5 p-4 rounded-lg ${
                index < dedicatedGPUs ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{gpu.name}</span>
                <span className={`text-sm ${
                  gpu.temp > 80 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {gpu.temp}°C
                </span>
              </div>
              <Progress
                value={gpu.load}
                className="h-2 bg-gray-700"
                indicatorClassName={
                  index < dedicatedGPUs
                    ? "bg-purple-500"
                    : "bg-blue-500"
                }
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">Load</span>
                <span className="text-xs text-gray-400">{gpu.load}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CPUs Section */}
      <Card className="bg-black/30 p-6 border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-medium text-white">CPU Resources</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Dedicate for Boosted Songs:</span>
            <RadioGroup
              value={dedicatedCPUs.toString()}
              onValueChange={handleCPUAssignment}
              className="flex space-x-2"
            >
              {[0, 1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center space-x-1">
                  <RadioGroupItem
                    value={num.toString()}
                    id={`cpu-${num}`}
                    className="text-blue-400"
                  />
                  <label
                    htmlFor={`cpu-${num}`}
                    className="text-sm text-gray-300"
                  >
                    {num}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cpus.map((cpu, index) => (
            <div
              key={cpu.id}
              className={`bg-white/5 p-4 rounded-lg ${
                index < dedicatedCPUs ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{cpu.name}</span>
                <span className={`text-sm ${
                  cpu.temp > 75 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {cpu.temp}°C
                </span>
              </div>
              <Progress
                value={cpu.load}
                className="h-2 bg-gray-700"
                indicatorClassName={
                  index < dedicatedCPUs
                    ? "bg-blue-500"
                    : "bg-green-500"
                }
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">Load</span>
                <span className="text-xs text-gray-400">{cpu.load}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HardwareMonitor;
