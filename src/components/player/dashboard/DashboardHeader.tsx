
import React from 'react';
import { X, Menu } from 'lucide-react';
import { MenuItem } from './menuItems';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  activeTab: string;
  menuItems: MenuItem[];
  onClose: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  menuItems,
  onClose
}) => {
  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/20">
      <div className="flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-1 md:w-2 h-6 md:h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
          <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h2>
        </div>
        <Button 
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/20 border border-white/30 rounded-lg transition-all min-w-[40px] min-h-[40px]"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
