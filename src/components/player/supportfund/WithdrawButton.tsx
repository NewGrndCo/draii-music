
import React from 'react';
import { DollarSign, Lock } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useToast } from '../../../hooks/use-toast';

interface WithdrawButtonProps {
  thresholdReached: boolean;
  onWithdrawClick: () => void;
  openTermsOfService: () => void;
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  thresholdReached,
  onWithdrawClick,
  openTermsOfService
}) => {
  const { toast } = useToast();
  
  // The withdraw feature is currently locked regardless of threshold
  const isFeatureLocked = true;
  
  const handleLockedFeatureClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The withdraw feature is currently in development and will be available soon!",
      duration: 3000,
    });
  };
  
  return (
    <div className="pt-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={isFeatureLocked ? handleLockedFeatureClick : onWithdrawClick}
              className={cn(
                "w-full text-white text-sm py-1 relative",
                isFeatureLocked 
                  ? "bg-gray-700 text-gray-400 cursor-pointer hover:bg-gray-600"
                  : thresholdReached 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
                    : "bg-gray-800 text-gray-400 cursor-pointer hover:bg-gray-700"
              )}
              size="sm"
            >
              {isFeatureLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded">
                  <Lock size={14} className="mr-1" />
                  <span>Coming Soon</span>
                </div>
              )}
              <DollarSign size={14} className="mr-1" /> Withdraw
            </Button>
          </TooltipTrigger>
          <TooltipContent className="glass backdrop-blur-xl shadow-glass">
            <p className="text-xs">
              {isFeatureLocked 
                ? "This feature is coming soon" 
                : thresholdReached 
                  ? "Withdraw your earnings" 
                  : "Need $15 minimum to withdraw"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <p className="text-xs text-center mt-2 text-white/60">
        {isFeatureLocked ? (
          <span>Withdraw functionality is under development</span>
        ) : (
          <>
            By using this feature, you agree to our
            <button 
              onClick={openTermsOfService}
              className="ml-1 text-white/80 hover:text-white underline"
            >
              Terms of Service
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default WithdrawButton;
