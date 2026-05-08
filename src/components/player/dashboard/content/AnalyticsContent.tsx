
import React from 'react';
import { Card } from '@/components/ui/card';
import { Song } from '../../../../data/musicData';

interface AnalyticsContentProps {
  songs: Song[];
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ songs }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Platform-Wide Summary</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">Total Streams</p>
            <p className="text-2xl font-bold text-white">24,689</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">KAS Mined</p>
            <p className="text-2xl font-bold text-white">5,423.76</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">SOL Earnings</p>
            <p className="text-2xl font-bold text-white">41.08</p>
          </div>
        </div>
        <div className="bg-white/5 h-40 rounded-lg flex items-center justify-center">
          <p className="text-gray-300">Analytics Graph Visualization</p>
        </div>
      </Card>
      
      <Card className="bg-black/30 p-6 border-0">
        <h3 className="text-xl font-medium text-white mb-4">Content Performance</h3>
        <div className="space-y-2">
          {songs.slice(0, 5).map((song, index) => (
            <div 
              key={song.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 w-6 text-center">{index + 1}</span>
                <img 
                  src={song.coverArt} 
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <h4 className="font-medium text-white">{song.title}</h4>
                  <p className="text-xs text-gray-300">{song.artist}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{Math.floor(Math.random() * 5000) + 1000} streams</p>
                <p className="text-xs text-gray-300">{(Math.random() * 100).toFixed(2)} KAS</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsContent;
