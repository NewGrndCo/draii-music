import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '../ui/scroll-area';
interface MiningDialogProps {
  showMiningDialog: boolean;
  setShowMiningDialog: (show: boolean) => void;
}
const MiningDialog: React.FC<MiningDialogProps> = ({
  showMiningDialog,
  setShowMiningDialog
}) => {
  const isMobile = useIsMobile();
  return <Dialog open={showMiningDialog} onOpenChange={setShowMiningDialog}>
      <DialogContent className="backdrop-blur-xl bg-black/70 border-white/10 text-white max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">FAN Powered Mining</DialogTitle>
          <DialogDescription className="text-white/80 text-xs">
            How you're contributing to artists
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className={`${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}`}>
          <div className="space-y-3 text-xs">
            <p className="text-white/90">When you play music, a portion of your device's processing power is used to generate SOL Tokens as passive earnings for artists. This process converts streaming time into cryptocurrency at a variable rate.</p>
            
            <h4 className="font-medium text-white mt-2 text-sm">How It Works:</h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-white/90">
              <li>The rate fluctuates based on network traffic</li>
              <li>Fewer miners means higher rates and vice versa</li>
              <li>Heart a song to show extra appreciation</li>
              <li>All processing is handled seamlessly in the background</li>
            </ul>
            
            <p className="italic text-white/70 text-xs">
              This process is lightweight and won't affect your device performance.
            </p>
          </div>
        </ScrollArea>
        
        <DialogFooter className={isMobile ? "mt-2" : ""}>
          <DialogClose asChild>
            <Button className="w-full h-8 text-sm bg-pink-500/70 hover:bg-pink-500/90">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default MiningDialog;