import React from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../ui/dialog';
import { formatRate } from '../../../../utils/earningsUtil';

interface RateDisplayProps {
  currentRate: number;
  isBoosted?: boolean;
  previousRate?: number;
}

const RateDisplay: React.FC<RateDisplayProps> = ({ 
  currentRate, 
  isBoosted = false, 
  previousRate 
}) => {
  const formattedRate = formatRate(currentRate);
  const rateChange = previousRate 
    ? ((currentRate - previousRate) / previousRate) * 100 
    : 0;

  return (
    <div 
      className={`flex items-center justify-between rounded-md bg-white/5 backdrop-blur-md px-3 py-1 mt-1 
        ${isBoosted ? 'ring-1 ring-blue-500/30' : ''}`} 
      style={{minHeight: 32}}
    >
      <div className="flex items-center gap-1">
        <span 
          className={`h-2 w-2 rounded-full 
            ${isBoosted ? 'bg-blue-400 animate-pulse' : 'bg-green-400'} 
            inline-block mr-1`} 
        />
        <span className="text-sm text-white/85 font-semibold">Rate</span>
        {isBoosted && (
          <span className="text-xs text-blue-400 font-medium ml-1">(Boosted)</span>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <button 
              className="text-white/40 hover:text-white/80 transition-colors ml-1" 
              aria-label="Rate info"
            >
              <Info size={14} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Understanding Your Earning Rate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Rate</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-mono text-green-400">
                    {formattedRate}
                  </span>
                  {rateChange !== 0 && (
                    <div className="flex items-center">
                      {rateChange > 0 ? (
                        <TrendingUp size={18} className="text-green-500 mr-1" />
                      ) : (
                        <TrendingDown size={18} className="text-red-500 mr-1" />
                      )}
                      <span 
                        className={`text-sm ${
                          rateChange > 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {Math.abs(rateChange).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Rate Factors</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400 mt-2"></span>
                    <div>
                      <p className="text-sm font-medium">Network Activity</p>
                      <p className="text-xs text-white/70">Higher network usage can affect rates</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400 mt-2"></span>
                    <div>
                      <p className="text-sm font-medium">Artist Boost Status</p>
                      <p className="text-xs text-white/70">Boosted artists earn at higher rates</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400 mt-2"></span>
                    <div>
                      <p className="text-sm font-medium">System Resources</p>
                      <p className="text-xs text-white/70">Available processing power impacts rate</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {isBoosted && (
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Boosted Status Active</h4>
                  <p className="text-xs text-white/70">This artist is currently boosted, resulting in higher earnings rates.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <span 
        className={`font-mono text-sm tabular-nums ${
          isBoosted ? 'text-blue-300' : 'text-green-300'
        }`}
      >
        {formattedRate}
      </span>
    </div>
  );
};

export default RateDisplay;
