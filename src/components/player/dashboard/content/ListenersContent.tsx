
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, MapPin, Headphones, Activity } from 'lucide-react';

const ListenersContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Listener Overview</h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-purple-400" />
              <p className="text-gray-300 text-sm">Total Listeners</p>
            </div>
            <p className="text-2xl font-bold text-white">12,845</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-green-400" />
              <p className="text-gray-300 text-sm">Active Now</p>
            </div>
            <p className="text-2xl font-bold text-white">1,247</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Headphones size={16} className="text-blue-400" />
              <p className="text-gray-300 text-sm">New This Week</p>
            </div>
            <p className="text-2xl font-bold text-white">573</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-red-400" />
              <p className="text-gray-300 text-sm">Locations</p>
            </div>
            <p className="text-2xl font-bold text-white">68</p>
          </div>
        </div>
        
        <div className="bg-white/5 h-64 rounded-lg flex items-center justify-center">
          <p className="text-gray-300">Global Listener Map Visualization</p>
        </div>
      </Card>
      
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Top Listener Demographics</h3>
        <div className="space-y-3">
          {[
            { country: 'United States', percentage: 34, listeners: 4367 },
            { country: 'United Kingdom', percentage: 18, listeners: 2312 },
            { country: 'Germany', percentage: 12, listeners: 1541 },
            { country: 'Canada', percentage: 9, listeners: 1156 },
            { country: 'Japan', percentage: 7, listeners: 898 }
          ].map((location, index) => (
            <div key={index} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white">{location.country}</h4>
                <div className="flex items-center mt-1">
                  <div className="w-24 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-300 ml-2">{location.percentage}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{location.listeners.toLocaleString()}</p>
                <p className="text-xs text-gray-300">listeners</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ListenersContent;
