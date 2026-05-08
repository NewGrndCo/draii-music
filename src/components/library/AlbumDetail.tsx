
import React from 'react';
import { Album, Song } from '../../data/musicData';
import { Music, Heart, AudioLines } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumDetailProps {
  album: Album;
  onSelectSong: (song: Song) => void;
  compact?: boolean;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ album, onSelectSong, compact = true }) => {
  // Format numbers for display with k/M suffix
  const formatCount = (count: number) => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    } else if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}k`;
    } else {
      return count.toString();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Album Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <img 
          src={album.coverArt} 
          alt={album.title} 
          className="w-36 h-36 rounded-xl object-cover shadow-2xl transition-transform hover:scale-105"
        />
        
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white mb-1">{album.title}</h2>
          <p className="text-white/80 text-lg">{album.artist}</p>
          <p className="text-cyan-300 text-sm mt-2 font-medium">{album.songs.length} songs</p>
        </div>
      </div>
      
      {/* Songs List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Music size={20} className="text-white" />
          <h3 className="text-base font-medium text-white">Songs</h3>
        </div>
        
        <div className={compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"}>
          {album.songs.map((song, index) => (
            <div 
              key={song.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-black/30 cursor-pointer transition-all duration-200",
                "border border-white/5 hover:border-white/10 hover:bg-black/50"
              )}
              onClick={() => onSelectSong(song)}
            >
              <span className="text-sm text-white/50 font-mono w-5 text-right">{index + 1}</span>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm text-white font-medium truncate">{song.title}</p>
                <p className="text-xs text-white/70 truncate">{song.artist}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/70">
                <div className="flex items-center gap-1">
                  <AudioLines size={14} className="text-cyan-400/80" />
                  <span>{formatCount(song.playCount || 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={14} className={cn(song.likesCount > 0 ? "text-pink-500" : "text-white/50")} fill={song.likesCount > 0 ? "currentColor" : "none"} />
                  <span>{formatCount(song.likesCount || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
