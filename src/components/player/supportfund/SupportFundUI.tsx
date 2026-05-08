
import React from 'react';
import FundInfo from './FundInfo';
import FundHeader from './FundHeader';
import { Skeleton } from '@/components/ui/skeleton';

interface SupportFundUIProps {
  currentEarnings: number;
  totalEarnings: number;
  currentRate: number;
  signalStrength: number;
  onOpenMiningInfo: () => void;
  openTermsOfService: () => void;
  isPlaying?: boolean;
  isBoosted?: boolean;
  initialReserve: number;
  isLoading?: boolean;
}

const SupportFundUI: React.FC<SupportFundUIProps> = ({
  currentEarnings,
  totalEarnings,
  currentRate,
  signalStrength,
  onOpenMiningInfo,
  openTermsOfService,
  isPlaying = false,
  isBoosted = false,
  initialReserve,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="relative space-y-2 bg-black/40 rounded-lg overflow-hidden border border-white/5 select-none p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-3 w-3 rounded-full bg-white/10" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-8 w-full bg-white/10" />
          <Skeleton className="h-3 w-2/3 bg-white/10" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative space-y-2 bg-black/40 rounded-lg overflow-hidden border border-white/5 select-none">
      <FundHeader 
        isPlaying={isPlaying} 
        openMiningInfo={onOpenMiningInfo} 
      />
      <FundInfo 
        currentEarnings={currentEarnings} 
        totalEarnings={totalEarnings} 
        initialReserve={initialReserve} 
        currentRate={currentRate} 
        signalStrength={signalStrength} 
        isBoosted={isBoosted} 
        onInfoClick={onOpenMiningInfo} 
      />
    </div>
  );
};

export default SupportFundUI;
