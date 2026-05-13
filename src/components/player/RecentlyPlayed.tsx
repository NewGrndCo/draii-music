import React, { memo } from 'react';
import { Song } from '../../data/musicData';
import { History } from 'lucide-react';

interface RecentlyPlayedProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

const RecentlyPlayed: React.FC<RecentlyPlayedProps> = ({ songs, onSelectSong }) => {
  if (!songs.length) return null;
  const list = songs.slice(0, 5);

  return (
    <div className="mt-2 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase text-white font-medium flex items-center gap-1.5">
          <History size={12} className="text-white/70" />
          Recently Played
        </h3>
      </div>
      <div className="space-y-1">
        {list.map((song) => (
          <div
            key={`recent-${song.id}`}
            className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors border border-white/5"
            onClick={() => onSelectSong(song)}
          >
            <div className="relative">
              <img
                src={song.coverArt}
                alt={song.title}
                className="w-8 h-8 rounded-md"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 rounded-md" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-white font-medium truncate">{song.title}</p>
              <p className="text-xs text-white/80 truncate">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(RecentlyPlayed);
