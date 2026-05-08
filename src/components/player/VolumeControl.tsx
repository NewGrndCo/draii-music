
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Square, Search, X } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (values: number[]) => void;
  toggleLayout: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  toggleLayout
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dispatch custom event for search
    const searchEvent = new CustomEvent('player-search', {
      detail: {
        query: searchQuery
      }
    });
    document.dispatchEvent(searchEvent);
  };

  // Handle input change with immediate search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Trigger search as user types
    const searchEvent = new CustomEvent('player-search', {
      detail: {
        query: value
      }
    });
    document.dispatchEvent(searchEvent);
  };

  // Toggle search bar visibility
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery('');
      // Clear search when hiding
      document.dispatchEvent(new CustomEvent('player-search', {
        detail: {
          query: ''
        }
      }));
    }
  };

  // Listen for external search events
  useEffect(() => {
    const handleExternalSearch = (e: any) => {
      if (e.detail?.query !== undefined) {
        setSearchQuery(e.detail.query);
        if (e.detail.query && !showSearch) {
          setShowSearch(true);
        }
      }
    };
    document.addEventListener('external-search', handleExternalSearch);
    return () => {
      document.removeEventListener('external-search', handleExternalSearch);
    };
  }, [showSearch]);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 px-[6px] mx-[9px]">
        <button 
          className="text-white hover:text-white/80 transition-colors p-2 touch-manipulation" 
          onClick={() => onVolumeChange([volume === 0 ? 0.8 : 0])}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className="py-2 touch-manipulation" style={{ minHeight: '44px' }}>
          <Slider 
            defaultValue={[0.8]} 
            max={1} 
            step={0.01} 
            value={[volume]} 
            onValueChange={onVolumeChange} 
            className="w-24"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {showSearch ? (
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search size={12} className="text-white/60" />
            </div>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={handleSearchChange} 
              placeholder="Search..." 
              className={cn(
                "bg-black/20 border border-white/10 rounded-full text-white text-xs",
                "py-1 pl-7 pr-7 w-40 focus:outline-none focus:ring-1 focus:ring-white/20",
                "backdrop-blur-md placeholder:text-white/40 touch-manipulation"
              )}
              style={{ minHeight: '32px' }}
              autoFocus 
            />
            <button 
              type="button" 
              onClick={toggleSearch} 
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-white/60 hover:text-white touch-manipulation"
              style={{ minHeight: '32px', minWidth: '32px' }}
            >
              <X size={12} />
            </button>
          </form>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleSearch} 
                  className="text-white/80 hover:text-white transition-colors p-2 touch-manipulation" 
                  aria-label="Search"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <Search size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/90 border-white/10 text-white text-xs">
                Search library
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
    </div>
  );
};

export default VolumeControl;
