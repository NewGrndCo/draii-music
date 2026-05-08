
import React from 'react';
import { formatEarnings } from '../../../../utils/earningsUtil';

interface NetworkEarningsRowProps {
  totalEarnings: number;
  initialReserve: number;
}

const NetworkEarningsRow: React.FC<NetworkEarningsRowProps> = ({
  totalEarnings,
  initialReserve
}) => {
  return <div className="flex items-center justify-between">
      <span className="text-sm text-white/80 font-normal">Network Earnings</span>
      <span className="font-mono text-sm text-white/90 tabular-nums">
        {formatEarnings(initialReserve + totalEarnings)}
      </span>
    </div>;
};

export default NetworkEarningsRow;
