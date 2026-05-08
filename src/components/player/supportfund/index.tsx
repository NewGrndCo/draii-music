
import React, { useEffect, useState } from 'react';
import SupportFundUI from './SupportFundUI';

export interface SupportFundProps {
  showEarnings: boolean;
  currentEarnings: number;
  totalEarnings: number;
  currentRate: number;
  signalStrength: number;
  networkUserCount: number;
  toggleMiningInfo: () => void;
  hideEarnings: () => void;
  openTermsOfService: () => void;
  getNetworkSignalIcon: () => JSX.Element;
  isPlaying?: boolean;
  isBoosted?: boolean;
  initialReserve: number;
}

const SupportFund: React.FC<SupportFundProps> = ({
  showEarnings,
  currentEarnings,
  totalEarnings,
  currentRate,
  signalStrength,
  networkUserCount,
  toggleMiningInfo,
  hideEarnings,
  openTermsOfService,
  getNetworkSignalIcon,
  isPlaying = false,
  isBoosted = false,
  initialReserve
}) => {
  // Reduce loading state for faster appearance
  const [isLoading, setIsLoading] = useState(true);
  
  // Much shorter delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150); // Reduced from 800ms to 150ms
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SupportFundUI
      currentEarnings={currentEarnings}
      totalEarnings={totalEarnings}
      currentRate={currentRate}
      signalStrength={signalStrength}
      onOpenMiningInfo={toggleMiningInfo}
      openTermsOfService={openTermsOfService}
      isPlaying={isPlaying}
      isBoosted={isBoosted}
      initialReserve={initialReserve}
      isLoading={isLoading}
    />
  );
};

export default SupportFund;
