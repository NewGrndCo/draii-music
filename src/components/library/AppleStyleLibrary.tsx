import React, { useMemo, useState } from 'react';
import { Album, Song } from '../../data/musicData';
import { Search, X, ArrowLeft, Music2, Disc3, User, Users, Clock } from 'lucide-react';
import AppleStyleSongRow from './AppleStyleSongRow';
import AlbumDetail from './AlbumDetail';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  albums: Album[];
  onSelectSong: (song: Song) => void;
  onClose: () => void;
  isVisible: boolean;
}

type Tab = 'songs' | 'albums' | 'singles' | 'collabs' | 'recent';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'songs', label: 'Songs', icon: Music2 },
  { key: 'albums', label: 'Albums', icon: Disc3 },
  { key: 'singles', label: 'Singles', icon: User },
  { key: 'collabs', label: 'Collabs', icon: Users },
  { key: 'recent', label: 'Recently Added', icon: Clock },
];

const AppleStyleLibrary: React.FC<Props> = ({ albums, onSelectSong, onClose, isVisible }) => {
  const [tab, setTab] = useState<Tab>('songs');
  const [query, setQuery] = useState('');
  const [openAlbum, setOpenAlbum] = useState<Album | null>(null);

  // Use the dedicated "All Songs" virtual album when present; fall back to flattening.
  const allSongs = useMemo(() => {
    const all = albums.find((a) => a.id === '__all__');
    if (all) return all.songs;
    const seen = new Set<string>();
    return albums.flatMap((a) => a.songs).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [albums]);

  // Real albums = anything except the virtual __all__ aggregator.
  const realAlbums = useMemo(
    () => albums.filter((a) => a.id !== '__all__'),
    [albums]
  );

  // Singles = explicitly flagged as single in the CMS and not part of an album/collab.
  const singles = useMemo(
    () => allSongs.filter((s) => (s.category || 'single').toLowerCase() === 'single' && !s.isCollab),
    [allSongs]
  );
  const collabs = useMemo(() => allSongs.filter((s) => !!s.isCollab), [allSongs]);

  const filtered = (list: Song[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.album || '').toLowerCase().includes(q)
    );
  };

  const filteredAlbums = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return realAlbums;
    return realAlbums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [realAlbums, query]);

  React.useEffect(() => {
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isVisible]);

  if (!isVisible) return null;

  const songsView = (list: Song[]) => (
    <div className="space-y-1">
      {list.length === 0 ? (
        <div className="text-sm text-white/45 px-3 py-12 text-center">No songs found</div>
      ) : (
        list.map((s, i) => (
          <AppleStyleSongRow key={s.id} song={s} index={i} onSelect={(song) => { onSelectSong(song); onClose(); }} />
        ))
      )}
    </div>
  );

  const renderTab = () => {
    switch (tab) {
      case 'songs':
        return songsView(filtered(allSongs));
      case 'singles':
        return songsView(filtered(singles));
      case 'collabs':
        return songsView(filtered(collabs));
      case 'recent':
        return songsView(filtered(allSongs).slice(0, 25));
      case 'albums':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAlbums.length === 0 ? (
              <div className="col-span-full text-sm text-white/45 px-3 py-12 text-center">No albums</div>
            ) : (
              filteredAlbums.map((a) => (
                <button key={a.id} onClick={() => setOpenAlbum(a)} className="text-left group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-white/[0.04] shadow-md group-hover:scale-[1.02] transition-transform">
                    <img src={a.coverArt} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 text-sm text-white truncate">{a.title}</div>
                  <div className="text-xs text-white/55 truncate">{a.artist}</div>
                </button>
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <div
        className="max-w-3xl mx-auto h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={openAlbum ? () => setOpenAlbum(null) : onClose} className="text-white/70 hover:text-white p-1.5 -ml-1.5">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {openAlbum ? openAlbum.title : 'Library'}
            </h1>
          </div>

          {!openAlbum && (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search songs, albums, artists"
                  className="w-full bg-white/[0.08] border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/25"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Apple-Music-style category pills */}
              <div className="mt-3 -mx-1 overflow-x-auto scrollbar-hidden">
                <div className="flex gap-1.5 px-1">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors',
                        tab === key
                          ? 'bg-white text-black font-medium'
                          : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1]'
                      )}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="px-3 sm:px-4 pb-12">
            {openAlbum ? (
              <AlbumDetail
                album={openAlbum}
                onSelectSong={(s) => { onSelectSong(s); onClose(); }}
                compact
              />
            ) : (
              renderTab()
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppleStyleLibrary;
