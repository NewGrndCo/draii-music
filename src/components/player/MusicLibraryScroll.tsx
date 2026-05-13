import React, { useMemo, useState } from 'react';
import { Song } from '../../data/musicData';
import { Music } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import SongListHeader from './library/SongListHeader';
import SongListItem from './library/SongListItem';

interface MusicLibraryScrollProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onEditSong?: (song: Song) => void;
  showEditButton?: boolean;
}

const MusicLibraryScroll: React.FC<MusicLibraryScrollProps> = ({
  songs,
  onSelectSong,
  onEditSong,
  showEditButton = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy] = useState<'artist' | 'title' | 'playCount' | 'likesCount'>('title');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  const formatCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toString();
  };

  const displaySongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? songs.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q) ||
            (s.album && s.album.toLowerCase().includes(q))
        )
      : songs;

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'artist') cmp = a.artist.localeCompare(b.artist);
      else if (sortBy === 'playCount') cmp = (a.playCount || 0) - (b.playCount || 0);
      else if (sortBy === 'likesCount') cmp = (a.likesCount || 0) - (b.likesCount || 0);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [songs, searchQuery, sortBy, sortOrder]);

  return (
    <div className="bg-black/20 border border-white/10 rounded-xl p-6">
      <ScrollArea className="h-[60vh] pb-4">
        <div className="space-y-4">
          <SongListHeader />

          <div className="space-y-2">
            {displaySongs.length > 0 ? (
              displaySongs.map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  onSelect={onSelectSong}
                  onEdit={showEditButton ? () => onEditSong?.(song) : undefined}
                  formatCount={formatCount}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/50">
                <Music size={32} />
                <p className="mt-4 text-sm">No songs found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MusicLibraryScroll;
