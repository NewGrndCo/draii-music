
import React, { useState } from 'react';
import CurrentEarningsRow from './components/CurrentEarningsRow';
import NetworkEarningsRow from './components/NetworkEarningsRow';
import RateDisplay from './components/RateDisplay';
import NetworkStatus from './components/NetworkStatus';
import AdvancedAnalytics from './AdvancedAnalytics';

interface FundInfoProps {
  currentEarnings: number;
  totalEarnings: number;
  initialReserve: number;
  currentRate: number;
  signalStrength: number;
  isBoosted?: boolean;
  onInfoClick: () => void;
}

const FundInfo: React.FC<FundInfoProps> = ({
  currentEarnings,
  totalEarnings,
  initialReserve,
  currentRate,
  signalStrength,
  isBoosted = false,
  onInfoClick
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleAnalyticsClick = () => {
    setShowAnalytics(true);
  };

  const closeAnalytics = () => {
    setShowAnalytics(false);
  };

  return (
    <>
      <div className="space-y-2 px-1 py-1 text-white">
        <CurrentEarningsRow currentEarnings={currentEarnings} />
        <NetworkEarningsRow totalEarnings={totalEarnings} initialReserve={initialReserve} />
        <RateDisplay currentRate={currentRate} isBoosted={isBoosted} />
        <NetworkStatus />
        <button
          onClick={handleAnalyticsClick}
          className="w-full text-center text-xs text-white/60 hover:text-white/90 transition-colors py-1 mt-1 bg-white/5 rounded"
        >
          View Network Analytics
        </button>
      </div>

      {showAnalytics && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <AdvancedAnalytics
            networkEarnings={totalEarnings}
            networkUserCount={Math.floor(Math.random() * 15) + 5}
            signalStrength={signalStrength}
            isPlaying={true}
            onClose={closeAnalytics}
          />
        </div>
      )}
    </>
  );
};

export default FundInfo;
