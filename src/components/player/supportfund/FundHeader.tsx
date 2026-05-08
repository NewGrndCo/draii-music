
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

interface FundHeaderProps {
  hideEarnings?: () => void;
  openMiningInfo?: () => void;
  isPlaying?: boolean;
}

const FundHeader: React.FC<FundHeaderProps> = ({
  hideEarnings,
  openMiningInfo,
  isPlaying
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold flex items-center text-white">
        Support Fund 
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className="text-white/40 hover:text-white/80 transition-colors ml-1 h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center"
              aria-label="Fund info"
            >
              <HelpCircle size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-4 space-y-3 w-72 bg-black/90 border-white/5 text-white">
            <h4 className="font-medium text-sm">Support Fund Details</h4>
            <div className="space-y-2">
              <div className="bg-black/20 p-2 rounded-md">
                <p className="text-xs text-white/90">This platform uses a portion of your device's processing power to generate passive earnings for artists while you listen.</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-white/90 font-medium">How support works:</p>
                <div className="space-y-1 text-xs text-white/80">
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5"></div>
                    <p>Your device contributes computing power while you enjoy music</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5"></div>
                    <p>Artists receive direct financial support from your listening time</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5"></div>
                    <p>Hearting songs increases the allocation to those artists</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5"></div>
                    <p>Global network allocates resources efficiently and securely</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-1">
                <p className="text-xs text-white/60 italic">You can view detailed analytics of your contributions through the chart button.</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </h3>
      <button 
        onClick={openMiningInfo} 
        className="text-white/70 hover:text-white transition-colors"
        disabled={!openMiningInfo}
      >
        {isPlaying && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>}
      </button>
    </div>
  );
};

export default FundHeader;
