
import React from 'react';
import { useAdminStats } from './hooks/useAdminStats';

interface StatProps {
  value: string | number;
  label: string;
  sublabel?: string;
}

const StatCard: React.FC<StatProps> = ({ value, label, sublabel }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
    {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
  </div>
);

const OverviewStats = () => {
  const stats = useAdminStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        value={stats.totalPlays.toLocaleString()} 
        label="Plays" 
        sublabel="+12% from last week" 
      />
      <StatCard 
        value={stats.activeListeners.toLocaleString()} 
        label="Listeners" 
        sublabel="Active now" 
      />
      <StatCard 
        value={stats.comments.toLocaleString()} 
        label="Comments" 
        sublabel="Last 24 hours" 
      />
      <StatCard 
        value={stats.likes.toLocaleString()} 
        label="Likes" 
        sublabel="This week" 
      />
    </div>
  );
};

export default OverviewStats;

