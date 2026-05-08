
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { getPaymentInfo } from '../../utils/earningsUtil';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '../ui/scroll-area';

interface PaymentDialogProps {
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  savePaymentInfo: () => void;
  paymentType: 'cashapp' | 'paypal';
  setPaymentType: (type: 'cashapp' | 'paypal') => void;
  paymentValue: string;
  setPaymentValue: (value: string) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  showPaymentDialog,
  setShowPaymentDialog,
  savePaymentInfo,
  paymentType,
  setPaymentType,
  paymentValue,
  setPaymentValue
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="backdrop-blur-xl bg-black/70 border-white/10 text-white max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle>Payment Info</DialogTitle>
          <DialogDescription className="text-white/60 text-sm">Enter your payment details below</DialogDescription>
          <DialogDescription className="text-white/70 text-sm">
            Enter details to receive earnings
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className={`${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}`}>
          <div className="space-y-3 py-1">
            <RadioGroup
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as 'cashapp' | 'paypal')}
              className="flex flex-col space-y-1.5"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cashapp" id="cashapp" />
                <Label htmlFor="cashapp" className="text-sm">CashApp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="text-sm">PayPal</Label>
              </div>
            </RadioGroup>
            
            <div className="space-y-1.5">
              <Label htmlFor="paymentValue" className="text-sm">
                {paymentType === 'cashapp' ? 'CashApp Username' : 'PayPal Email'}
              </Label>
              <Input
                id="paymentValue"
                value={paymentValue}
                onChange={(e) => setPaymentValue(e.target.value)}
                placeholder={paymentType === 'cashapp' ? '$username' : 'email@example.com'}
                className="bg-black/20 border-white/20 text-sm h-9"
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className={isMobile ? "flex-col space-y-2 mt-2" : ""}>
          <Button onClick={savePaymentInfo} className="w-full h-9 text-sm bg-pink-500/70 hover:bg-pink-500/90">Save Payment Info</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
