
import React from 'react';
import { Wifi } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  return (
    <div className="flex items-center justify-between mt-2">
      <span className="text-sm text-white/80 font-normal">Network</span>
      <span className="flex items-center gap-2">
        <Wifi size={18} className="text-green-400 animate-pulse drop-shadow-[0_0_3px_#4ade80]" />
        <span className="text-green-300 text-sm font-medium">Connected</span>
      </span>
    </div>
  );
};

export default NetworkStatus;
