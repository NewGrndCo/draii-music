
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
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface TermsDialogProps {
  showFullTerms: boolean;
  setShowFullTerms: (show: boolean) => void;
}

const TermsDialog: React.FC<TermsDialogProps> = ({
  showFullTerms,
  setShowFullTerms
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={showFullTerms} onOpenChange={setShowFullTerms}>
      <DialogContent className="dialog-content-enter backdrop-blur-xl bg-black/70 border-white/10 text-white max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">Terms of Service</DialogTitle>
          <DialogDescription className="text-white/70 text-xs">
            Please read our terms carefully
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className={`${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}`}>
          <div className="space-y-3 text-xs p-1">
            <p className="text-white/90">
              Welcome to draii.io! By using our service, you agree to the following terms:
            </p>
            
            <h4 className="font-medium text-white mt-2 text-sm">1. Support Fund</h4>
            <p className="text-white/90">
              By using draii.io, you consent to the use of your device's processing power to contribute to our Support Fund. This helps compensate artists and maintain our platform.
            </p>
            
            <h4 className="font-medium text-white mt-2 text-sm">2. Content Usage</h4>
            <p className="text-white/90">
              All music and content on draii.io is protected by copyright. You may stream content for personal, non-commercial use only.
            </p>
            
            <h4 className="font-medium text-white mt-2 text-sm">3. User Contributions</h4>
            <p className="text-white/90">
              When you reach the minimum threshold ($15.00), you may withdraw your contributions. Payment processing may take up to 7 business days.
            </p>
            
            <h4 className="font-medium text-white mt-2 text-sm">4. Privacy</h4>
            <p className="text-white/90">
              We respect your privacy and collect only essential information needed to provide our service. Your payment information is stored locally on your device.
            </p>
            
            {isMobile && (
              <>
                <h4 className="font-medium text-white mt-2 text-sm">5. Mobile Device Permissions</h4>
                <p className="text-white/90">
                  For mobile users, draii.io requires access to your device's WiFi connection information and location services. These permissions help us:
                </p>
                <ul className="list-disc pl-4 text-white/80 space-y-1 mt-1">
                  <li>Ensure stable network connectivity for uninterrupted playback</li>
                  <li>Calculate region-specific contribution rates</li>
                  <li>Optimize streaming quality based on your connection</li>
                  <li>Enable advanced network features for improved earnings</li>
                </ul>
              </>
            )}
            
            <p className="italic text-white/60 text-xs mt-3">
              Last updated: May 2023
            </p>
          </div>
        </ScrollArea>
        
        <DialogFooter className={isMobile ? "mt-2" : ""}>
          <DialogClose asChild>
            <Button className="w-full h-8 text-sm bg-pink-500/70 hover:bg-pink-500/90">Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
