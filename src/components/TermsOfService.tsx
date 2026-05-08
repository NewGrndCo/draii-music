
import React, { useState } from 'react';
import { Info, X, AlertCircle, Cpu, Book } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import TermsDialog from './player/TermsDialog';

const TermsOfService: React.FC = () => {
  const [showPopover, setShowPopover] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  
  const openFullTerms = () => {
    setShowPopover(false);
    setShowFullTerms(true);
  };
  
  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-1 flex justify-center items-center">
        <div className="text-white/50 text-xs flex items-center gap-1 animate-pulse-slow">
          <Cpu size={12} />
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <button className="underline hover:text-white/80">
                By using this app, you accept our Terms of Service
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm glass backdrop-blur-xl p-4 border-0 text-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold flex items-center gap-1">
                  <AlertCircle size={14} /> Terms of Service
                </h3>
                <button onClick={() => setShowPopover(false)}>
                  <X size={14} />
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs">
                  By using the draii.io music player, you agree to the following terms:
                </p>
                
                <div className="bg-black/20 p-2 rounded text-xs">
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <Cpu size={12} className="text-emerald-400" /> Streaming & Mining Process
                  </h4>
                  <p className="mb-2">
                    When you play music, a portion of your device's processing power is used to generate 
                    passive earnings for artists. This process converts streaming time into cryptocurrency at 
                    a variable rate (approximately 0.1348¢ per second, fluctuating up to 0.7593¢).
                  </p>
                  <button 
                    onClick={openFullTerms} 
                    className="text-xs underline text-white/70 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Book size={10} /> Read Full Terms
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Full Terms of Service Dialog */}
      <TermsDialog 
        showFullTerms={showFullTerms}
        setShowFullTerms={setShowFullTerms}
      />
    </>
  );
};

export default TermsOfService;
