
import React, { useState, useEffect } from 'react';
import { Song } from '../../data/musicData';
import { Music } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SongEditData } from './library/types';
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
  showEditButton = false
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displaySongs, setDisplaySongs] = useState<Song[]>(songs);
  const [sortBy, setSortBy] = useState<'artist' | 'title' | 'playCount' | 'likesCount'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingSong, setEditingSong] = useState<SongEditData | null>(null);
  const [loading, setLoading] = useState(false);
  
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

  // Filter songs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDisplaySongs(songs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query))
      );
      setDisplaySongs(filtered);
    }
  }, [songs, searchQuery]);
  
  // Sort songs when sort criteria changes
  useEffect(() => {
    const sortedSongs = [...displaySongs].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'artist') {
        comparison = a.artist.localeCompare(b.artist);
      } else if (sortBy === 'playCount') {
        comparison = (a.playCount || 0) - (b.playCount || 0);
      } else if (sortBy === 'likesCount') {
        comparison = (a.likesCount || 0) - (b.likesCount || 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setDisplaySongs(sortedSongs);
  }, [sortBy, sortOrder, displaySongs]);

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
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MusicLibraryScroll;
