import React, { useMemo, useState } from 'react';
import { Album, Song } from '../../data/musicData';
import { Search, X, ArrowLeft, ChevronRight } from 'lucide-react';
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

const TABS: { key: Tab; label: string }[] = [
  { key: 'songs', label: 'Songs' },
  { key: 'albums', label: 'Albums' },
  { key: 'singles', label: 'Singles' },
  { key: 'collabs', label: 'Collabs' },
  { key: 'recent', label: 'Recently Played' },
];

const AppleStyleLibrary: React.FC<Props> = ({ albums, onSelectSong, onClose, isVisible }) => {
  const [tab, setTab] = useState<Tab>('albums');
  const [query, setQuery] = useState('');
  const [openAlbum, setOpenAlbum] = useState<Album | null>(null);

  // Flatten all songs across albums + standalone pool, dedup by id.
  const allSongs = useMemo(() => {
    const seen = new Set<string>();
    const out: Song[] = [];
    for (const a of albums) {
      for (const s of a.songs || []) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        out.push(s);
      }
    }
    return out;
  }, [albums]);

  // Albums tab = real albums/projects only (exclude virtual singles aggregator).
  const realAlbums = useMemo(
    () => albums.filter((a) => a.id !== 'singles-pool' && (a.songs?.length || 0) > 0),
    [albums]
  );

  // Singles = explicitly category=single and not a collab.
  const singles = useMemo(
    () => allSongs.filter((s) => (s.category || 'single').toLowerCase() === 'single' && !s.isCollab),
    [allSongs]
  );

  // Collabs = any track flagged is_collaboration.
  const collabs = useMemo(() => allSongs.filter((s) => !!s.isCollab), [allSongs]);

  const recents = useMemo(() => allSongs.slice(0, 12), [allSongs]);

  const matchesQuery = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const filterSongs = (list: Song[]) => {
    if (!query.trim()) return list;
    return list.filter((s) => matchesQuery(s.title) || matchesQuery(s.artist) || matchesQuery(s.album || ''));
  };
  const filteredAlbums = useMemo(() => {
    if (!query.trim()) return realAlbums;
    return realAlbums.filter((a) => matchesQuery(a.title) || matchesQuery(a.artist));
  }, [realAlbums, query]);

  React.useEffect(() => {
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isVisible]);

  if (!isVisible) return null;

  const AlbumRow: React.FC<{ album: Album }> = ({ album }) => (
    <button
      onClick={() => setOpenAlbum(album)}
      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors text-left border-b border-white/5 last:border-b-0"
    >
      <div className="h-14 w-14 rounded-md overflow-hidden bg-white/[0.04] shrink-0">
        <img src={album.coverArt} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-white truncate">{album.title}</div>
        <div className="text-xs text-white/55 truncate">{album.artist}{album.year ? ` · ${album.year}` : ''}</div>
      </div>
      <ChevronRight size={18} className="text-white/35 shrink-0" />
    </button>
  );

  const songsView = (list: Song[]) => (
    <div className="space-y-0.5">
      {list.length === 0 ? (
        <div className="text-sm text-white/45 px-3 py-12 text-center">No songs found</div>
      ) : (
        list.map((s, i) => (
          <AppleStyleSongRow key={s.id} song={s} index={i} onSelect={(song) => { onSelectSong(song); onClose(); }} />
        ))
      )}
    </div>
  );

  const albumsView = (
    <div className="space-y-0">
      {filteredAlbums.length === 0 ? (
        <div className="text-sm text-white/45 px-3 py-12 text-center">No albums yet</div>
      ) : (
        filteredAlbums.map((a) => <AlbumRow key={a.id} album={a} />)
      )}
    </div>
  );

  const renderTab = () => {
    switch (tab) {
      case 'songs':   return songsView(filterSongs(allSongs));
      case 'singles': return songsView(filterSongs(singles));
      case 'collabs': return songsView(filterSongs(collabs));
      case 'recent':  return songsView(filterSongs(recents));
      case 'albums':  return albumsView;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl" onClick={onClose}>
      <div className="max-w-3xl mx-auto h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={openAlbum ? () => setOpenAlbum(null) : onClose}
              className="text-white/70 hover:text-white p-1.5 -ml-1.5"
              aria-label="Back"
            >
              <ArrowLeft size={22} />
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

              <div className="mt-3 -mx-1 overflow-x-auto scrollbar-hidden">
                <div className="flex gap-1.5 px-1">
                  {TABS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                        tab === key
                          ? 'bg-white text-black font-semibold'
                          : 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]'
                      )}
                    >
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
