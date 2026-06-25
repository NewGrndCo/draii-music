import React, { useState, lazy, Suspense } from 'react';
import { Square, DollarSign, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
const DonateDialog = lazy(() => import('./DonateDialog'));
import { usePlayer } from '../../contexts/PlayerContext';
import { useArtistProfile } from '@/hooks/useArtistProfile';

interface VolumeControlProps {
  volume?: number;
  onVolumeChange?: (values: number[]) => void;
  toggleLayout: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ toggleLayout }) => {
  const [donateOpen, setDonateOpen] = useState(false);
  const { currentSong } = usePlayer();
  const { profile } = useArtistProfile();

  const supportEnabled = profile?.support_fund_enabled !== false;

  const handleSupport = () => {
    const link = profile?.stripe_payment_link?.trim();
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      setDonateOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="flex items-center gap-2">
        {currentSong?.dspLink && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={currentSong.dspLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Available on streaming services"
                  className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/15 hover:border-white/30 rounded-full px-2.5 py-1 transition-colors touch-manipulation"
                  style={{ minHeight: '32px' }}
                >
                  <ExternalLink size={12} />
                  <span>Available on</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/90 border-white/10 text-white text-xs">
                Open streaming links
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center gap-3">

        {supportEnabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSupport}
                  aria-label="Support the artist"
                  className="text-emerald-400/90 hover:text-emerald-300 transition-colors p-2 touch-manipulation"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <DollarSign size={20} strokeWidth={2.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/90 border-white/10 text-white text-xs">
                Support fund
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleLayout}
                aria-label="Toggle fullscreen"
                className="text-white/80 hover:text-white transition-colors p-2 touch-manipulation"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Square size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-black/90 border-white/10 text-white text-xs">
              Toggle fullscreen
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {donateOpen && (
        <Suspense fallback={null}>
          <DonateDialog
            open={donateOpen}
            onOpenChange={setDonateOpen}
            songId={currentSong?.id}
            songTitle={currentSong?.title}
          />
        </Suspense>
      )}
    </div>
  );
};

export default React.memo(VolumeControl);
