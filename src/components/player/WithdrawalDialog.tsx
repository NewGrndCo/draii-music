import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { formatEarnings } from '../../utils/earningsUtil';
import { ScrollArea } from '../ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface WithdrawalDialogProps {
  showWithdrawalDialog: boolean;
  setShowWithdrawalDialog: (show: boolean) => void;
  totalEarnings: number;
  paymentInfo: { type: 'cashapp' | 'paypal'; value: string } | null;
  setShowPaymentDialog: (show: boolean) => void;
  processActualWithdrawal: () => void;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  showWithdrawalDialog,
  setShowWithdrawalDialog,
  totalEarnings,
  paymentInfo,
  setShowPaymentDialog,
  processActualWithdrawal
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const isMobile = useIsMobile();
  
  // Feature locked state
  const isFeatureLocked = true;
  
  const handleWithdraw = () => {
    if (isFeatureLocked) {
      return;
    }
    
    if (!paymentInfo) {
      setShowWithdrawalDialog(false);
      setShowPaymentDialog(true);
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      processActualWithdrawal();
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };
  
  const handleClose = () => {
    setShowWithdrawalDialog(false);
    if (isComplete) {
      // Reset state for next time
      setIsComplete(false);
    }
  };
  
  return (
    <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
      <DialogContent className="backdrop-blur-xl bg-black/50 border-white/10 text-white max-w-md dialog-content-enter">
        <DialogHeader className="space-y-1">
          <DialogDescription className="sr-only">Withdraw your earnings</DialogDescription>
          <DialogTitle className="text-base flex items-center gap-2">
            {isFeatureLocked ? (
              <>
                <Lock size={16} className="text-yellow-400" /> 
                Feature Coming Soon
              </>
            ) : isComplete ? (
              "Withdrawal Complete"
            ) : (
              "Withdraw Earnings"
            )}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-xs">
            {isFeatureLocked ? (
              "The withdrawal feature is currently in development"
            ) : isComplete ? (
              "Your earnings have been sent to your account"
            ) : (
              "You're about to withdraw your earned funds"
            )}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className={`${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}`}>
          <div className="space-y-3 text-xs p-1">
            {isFeatureLocked ? (
              <div className="p-4 rounded-lg bg-black/20 text-center space-y-2">
                <Lock size={28} className="mx-auto text-yellow-400 mb-2" />
                <p className="text-white/80 text-sm font-medium">Withdraw Feature Coming Soon</p>
                <p className="text-white/60">
                  We're working hard to bring you withdrawal functionality. Thank you for your patience!
                </p>
                <div className="mt-4 p-2 bg-black/30 rounded text-left">
                  <p className="text-white/80 mb-1 font-medium">Current Balance:</p>
                  <p className="font-mono text-white text-sm">{formatEarnings(totalEarnings)}</p>
                </div>
              </div>
            ) : isComplete ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <CheckCircle size={36} className="text-green-400" />
                <p className="font-medium text-base text-white">
                  {formatEarnings(totalEarnings)}
                </p>
                <p className="text-white/70 text-center max-w-[250px] text-xs">
                  Has been sent to your {paymentInfo?.type === 'cashapp' ? 'CashApp' : 'PayPal'} account. 
                  Please allow up to 7 business days for processing.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                  <span className="text-white/80 text-xs">Available Balance:</span>
                  <span className="font-mono font-medium text-white text-sm">
                    {formatEarnings(totalEarnings)}
                  </span>
                </div>
                
                {paymentInfo ? (
                  <div className="flex flex-col space-y-1 p-2 bg-black/20 rounded-lg">
                    <span className="text-white/80 text-xs">Withdrawal Method:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {paymentInfo.type === 'cashapp' ? 'CashApp' : 'PayPal'}
                      </span>
                      <span className="text-white/70 text-xs">•</span>
                      <span className="text-white/90 font-mono text-xs">
                        {paymentInfo.value}
                      </span>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowWithdrawalDialog(false);
                        setShowPaymentDialog(true);
                      }} 
                      variant="link" 
                      className="text-xs justify-start p-0 h-auto text-white/60 hover:text-white"
                    >
                      Change payment method
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 bg-black/20 rounded-lg space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-yellow-400" />
                      <span className="text-white/90 font-medium text-xs">No Payment Method</span>
                    </div>
                    <p className="text-white/70 text-xs">
                      You need to set up a payment method before withdrawing.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className={isMobile ? "flex-col space-y-2 mt-2" : ""}>
          {isFeatureLocked ? (
            <Button onClick={handleClose} className="w-full h-9 text-sm bg-gray-700 hover:bg-gray-600">
              Close
            </Button>
          ) : isComplete ? (
            <Button onClick={handleClose} className="w-full h-9 text-sm bg-pink-500/70 hover:bg-pink-500/90">Close</Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto flex-col-reverse sm:flex-row">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="border-white/20 text-white hover:bg-white/10 h-9 text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw}
                disabled={isProcessing || isFeatureLocked}
                className={`h-9 text-sm ${
                  isFeatureLocked 
                    ? "bg-gray-700 cursor-not-allowed" 
                    : "bg-gradient-to-r from-pink-500/70 to-purple-500/70 hover:from-pink-500/90 hover:to-purple-500/90"
                }`}
              >
                {isProcessing ? "Processing..." : paymentInfo ? "Withdraw Now" : "Set Payment Info"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
