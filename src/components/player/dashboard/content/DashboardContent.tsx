
import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, Play, TrendingUp, Users } from 'lucide-react';
import { Song } from '../../../../data/musicData';
import OverviewStats from '../OverviewStats';
import FeaturedSongs from '../FeaturedSongs';

interface DashboardContentProps {
  songs: Song[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({ songs }) => {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-purple-400" size={24} />
          <h3 className="text-xl font-semibold text-white">Platform Overview</h3>
        </div>
        <OverviewStats />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Play className="text-purple-400" size={24} />
          <h3 className="text-xl font-semibold text-white">Boosted Songs</h3>
        </div>
        <FeaturedSongs songs={songs} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-purple-400" size={24} />
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {songs.slice(0, 4).map(song => (
            <Card 
              key={song.id}
              className="bg-black/30 hover:bg-black/40 transition-all border border-white/10 hover:border-purple-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={song.coverArt} 
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover ring-2 ring-white/10"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-black"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{song.title}</h4>
                    <p className="text-sm text-white/60">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-white/60 text-sm font-mono">{song.duration}</span>
                  <div className="flex items-center space-x-1 text-white/60">
                    <Heart size={16} className="text-pink-400" />
                    <span className="text-sm">{song.likesCount}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardContent;
