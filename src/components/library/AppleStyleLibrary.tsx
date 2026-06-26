import React, { useMemo, useState } from 'react';
import { Album, Song } from '../../data/musicData';
import { Search, X, ArrowLeft } from 'lucide-react';
import AppleStyleSongRow from './AppleStyleSongRow';
import AlbumDetail from './AlbumDetail';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface Props {
  albums: Album[];
  onSelectSong: (song: Song) => void;
  onClose: () => void;
  isVisible: boolean;
  initialAlbumSlug?: string | null;
}

type Tab = 'songs' | 'albums' | 'singles' | 'collabs' | 'recent';

const TABS: { key: Tab; label: string }[] = [
  { key: 'songs', label: 'Songs' },
  { key: 'albums', label: 'Albums' },
  { key: 'singles', label: 'Singles' },
  { key: 'collabs', label: 'Collabs' },
  { key: 'recent', label: 'Recently Played' },
];

const AppleStyleLibrary: React.FC<Props> = ({ albums, onSelectSong, onClose, isVisible, initialAlbumSlug }) => {
  const [tab, setTab] = useState<Tab>('albums');
  const [query, setQuery] = useState('');
  const [openAlbum, setOpenAlbum] = useState<Album | null>(null);

  // Auto-open an album when arriving via a shared link (?a=<slug>).
  React.useEffect(() => {
    if (!isVisible || !initialAlbumSlug || openAlbum) return;
    const match = albums.find((a) => a.slug === initialAlbumSlug || a.id === initialAlbumSlug);
    if (match) setOpenAlbum(match);
  }, [isVisible, initialAlbumSlug, albums, openAlbum]);

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

  // Albums tab = real albums/EPs only (exclude singles + virtual pool).
  const realAlbums = useMemo(
    () => albums.filter((a) => {
      if (a.id === 'singles-pool') return false;
      if (!(a.songs?.length)) return false;
      const cat = (a.songs[0]?.category || '').toLowerCase();
      return cat === 'album' || cat === 'ep';
    }),
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

  const AlbumCard: React.FC<{ album: Album }> = ({ album }) => {
    const trackCount = album.songs?.length || 0;
    return (
      <button
        onClick={() => setOpenAlbum(album)}
        className="group text-left flex flex-col gap-2 focus:outline-none"
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/[0.04] shadow-lg ring-1 ring-white/5 group-hover:ring-white/15 transition">
          <img
            src={album.coverArt}
            alt={album.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
        <div className="min-w-0 px-0.5">
          <div className="text-sm font-semibold text-white truncate">{album.title}</div>
          <div className="text-[10px] text-white/55 uppercase tracking-widest truncate">
            ALBUM · {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
          </div>
        </div>
      </button>
    );
  };

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
    <div>
      {filteredAlbums.length === 0 ? (
        <div className="text-sm text-white/45 px-3 py-12 text-center">No albums yet</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 px-1 pt-1">
          {filteredAlbums.map((a) => <AlbumCard key={a.id} album={a} />)}
        </div>
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
