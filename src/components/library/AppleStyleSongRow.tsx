import React from 'react';
import { Heart, Play } from 'lucide-react';
import { Song } from '../../data/musicData';
import { cn } from '@/lib/utils';
import SmartCover from '@/components/shared/SmartCover';

interface Props {
  song: Song;
  index: number;
  onSelect: (song: Song) => void;
}

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

const AppleStyleSongRow: React.FC<Props> = ({ song, index, onSelect }) => (
  <button
    onClick={() => onSelect(song)}
    className="group w-full grid grid-cols-[28px_44px_1fr_auto] sm:grid-cols-[36px_48px_1fr_auto_auto_56px] items-center gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-left"
  >
    <span className="text-xs sm:text-sm text-white/40 tabular-nums text-center group-hover:hidden">{index + 1}</span>
    <Play size={14} className="hidden group-hover:block text-white/80 mx-auto" />
    <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-md overflow-hidden bg-white/[0.04] shrink-0">
      {song.coverArt && (
        <img src={song.coverArt} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      )}
    </div>
    <div className="min-w-0">
      <div className="text-sm sm:text-[15px] text-white truncate">{song.title}</div>
      <div className="text-xs text-white/55 truncate">{song.artist}</div>
    </div>
    <div className="hidden sm:flex items-center gap-1 text-xs text-white/55 tabular-nums">
      <span>{formatCount(song.playCount || 0)}</span>
      <span className="text-white/30">plays</span>
    </div>
    <div className="hidden sm:flex items-center gap-1 text-xs text-white/55 tabular-nums">
      <Heart size={12} className={cn(song.likesCount ? 'text-pink-500' : 'text-white/40')} fill={song.likesCount ? 'currentColor' : 'none'} />
      <span>{formatCount(song.likesCount || 0)}</span>
    </div>
    <div className="text-xs text-white/45 tabular-nums text-right">{song.duration}</div>
  </button>
);

export default React.memo(AppleStyleSongRow);
