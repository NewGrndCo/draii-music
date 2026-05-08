
import React from 'react';
import { MenuItem } from './menuItems';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  menuItems: MenuItem[];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  menuItems
}) => {
  return (
    <div className="w-16 md:w-64 bg-black/60 backdrop-blur-xl p-2 md:p-6 flex flex-col border-r border-white/20">
      <div className="mb-6 md:mb-8 flex items-center justify-center md:justify-start space-x-3">
        <div className="relative">
          <img 
            src="/lovable-uploads/5ae7ab3a-8c2b-4cbe-9d1d-322b4912ca63.png" 
            alt="Draii Logo" 
            width={32} 
            height={32} 
            className="md:w-10 md:h-10 rounded-full ring-2 ring-purple-400/40"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full border border-black"></div>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-white drop-shadow">draii.io</p>
          <p className="text-xs text-white/70">Admin Dashboard</p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={cn(
              "w-full flex items-center justify-center md:justify-start md:space-x-3 px-1 md:px-4 py-3 md:py-3 rounded-lg text-left transition-all duration-200 group min-h-[44px]",
              activeTab === id 
                ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/30 text-white font-medium border border-purple-500/50 shadow-lg shadow-purple-500/20' 
                : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
            )}
            onClick={() => setActiveTab(id)}
            title={label}
          >
            <Icon 
              size={20} 
              className={cn(
                "transition-colors flex-shrink-0",
                activeTab === id ? "text-purple-300" : "text-white/70 group-hover:text-white"
              )}
            />
            <span className="hidden md:inline text-sm font-medium text-white drop-shadow">{label}</span>
            {activeTab === id && (
              <div className="hidden md:block ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/20">
        <div className="text-xs text-white/60 text-center md:text-left font-mono">
          v2.1.0
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
