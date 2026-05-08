
import React from 'react';
import { formatEarnings } from '../../../../utils/earningsUtil';

interface CurrentEarningsRowProps {
  currentEarnings: number;
}

const CurrentEarningsRow: React.FC<CurrentEarningsRowProps> = ({
  currentEarnings
}) => {
  return <div className="flex items-center justify-between">
      <span className="text-sm text-white/80 font-normal">Current Session</span>
      <span className="font-mono text-sm text-white/90 tabular-nums">
        {formatEarnings(currentEarnings)}
      </span>
    </div>;
};

export default CurrentEarningsRow;
