
import React from 'react';
import { Song } from '../../../data/musicData';
import { Heart, AudioLines, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SongListItemProps {
  song: Song;
  onSelect: (song: Song) => void;
  onEdit?: (song: Song) => void;
  formatCount: (count: number) => string;
}

const SongListItem = ({ song, onSelect, onEdit, formatCount }: SongListItemProps) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 rounded-lg bg-black/30 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
      <div className="relative" onClick={() => onSelect(song)}>
        <img
          src={song.coverArt}
          alt={song.title}
          className="w-12 h-12 rounded-lg object-cover border border-white/20"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
          <AudioLines size={16} className="text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden" onClick={() => onSelect(song)}>
        <p className="text-sm text-white font-medium truncate">{song.title}</p>
        <p className="text-xs text-white/60 truncate">{song.artist}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1 text-xs text-white/70">
          <AudioLines size={12} className="text-purple-400/80" />
          <span>{formatCount(song.playCount || 0)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-white/70">
          <Heart
            size={12}
            className={cn(song.likesCount > 0 ? "text-pink-500" : "")}
            fill={song.likesCount > 0 ? "currentColor" : "none"}
          />
          <span>{formatCount(song.likesCount || 0)}</span>
        </div>

        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 hover:bg-white/20 border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(song);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SongListItem;
