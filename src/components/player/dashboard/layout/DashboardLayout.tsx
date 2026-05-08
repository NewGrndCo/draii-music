
import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface DashboardLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  isOpen,
  onClose,
  isFullScreen,
  onToggleFullScreen,
  children
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${isFullScreen 
            ? 'fixed inset-0 w-screen h-screen max-w-none p-0 m-0' 
            : 'max-w-[95vw] md:max-w-6xl h-[95vh] md:h-[90vh] p-0'
          } 
          bg-[#121212] text-white overflow-y-auto
        `}
      >
        <DialogTitle className="sr-only">Admin Dashboard</DialogTitle>
        
        {/* Enhanced mobile-friendly header controls */}
        <div className="absolute top-2 right-2 z-50 flex gap-2">
          <button 
            onClick={onToggleFullScreen}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <Maximize2 size={20} />
          </button>

          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DashboardLayout;
