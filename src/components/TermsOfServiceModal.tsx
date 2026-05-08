
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Cpu, Info, Wifi, MapPin } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const TermsOfServiceModal = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Check if user has already accepted the terms
  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('termsAccepted');
    if (!hasAcceptedTerms) {
      setOpen(true);
    }
  }, []);

  const acceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Info size={18} className="text-pink-400" />
            Welcome to draii.io
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">Review and accept the terms to continue</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3 text-sm">
          <p>
            By using this music player, you agree to our Terms of Service.
          </p>
          
          <div className="bg-white/5 p-3 rounded-lg space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Cpu size={14} className="text-cyan-400" /> 
              How It Works
            </h3>
            <p className="text-white/80 text-xs leading-relaxed">
              When you play music, a small portion of your device's processing power is used to generate 
              passive earnings for artists. This process converts your streaming time into cryptocurrency 
              at variable rates, helping support the artists you love.
            </p>
          </div>
          
          {isMobile && (
            <div className="bg-white/5 p-3 rounded-lg space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Wifi size={14} className="text-green-400" /> 
                <MapPin size={14} className="text-red-400" /> 
                Device Permissions
              </h3>
              <p className="text-white/80 text-xs leading-relaxed">
                To optimize your experience on mobile devices, this app requires permission to access your device's WiFi and location services. 
                These permissions help us maintain a stable connection and calculate accurate earnings based on your location.
              </p>
            </div>
          )}
          
          <p className="text-xs text-white/60 italic">
            You can read our full Terms of Service at any time in the app settings.
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={acceptTerms}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            I Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceModal;
