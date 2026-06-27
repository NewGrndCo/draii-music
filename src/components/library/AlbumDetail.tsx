import React from 'react';
import { Album, Song } from '../../data/musicData';
import { Play, Shuffle, Share2 } from 'lucide-react';
import AppleStyleSongRow from './AppleStyleSongRow';
import { copyToClipboard } from '../../utils/shareUtils';
import { toast } from 'sonner';
import { SITE_URL } from '@/lib/siteUrl';
import SmartCover from '@/components/shared/SmartCover';

interface AlbumDetailProps {
  album: Album;
  onSelectSong: (song: Song) => void;
  compact?: boolean;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ album, onSelectSong }) => {
  const tracks = album.songs || [];

  const playAll = () => {
    if (tracks[0]) onSelectSong(tracks[0]);
  };

  const shuffle = () => {
    if (!tracks.length) return;
    onSelectSong(tracks[Math.floor(Math.random() * tracks.length)]);
  };

  const share = async () => {
    const key = album.slug || album.id;
    const url = `${SITE_URL}?a=${encodeURIComponent(key)}`;
    const data = { title: album.title, text: `${album.title} — ${album.artist}`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else { await copyToClipboard(url); toast.success('Album link copied'); }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        await copyToClipboard(url);
        toast.success('Album link copied');
      }
    }
  };

  const metaParts = [(album.type || 'album').toUpperCase()];
  if (album.year) metaParts.push(album.year);
  metaParts.push(`${tracks.length} TRACK${tracks.length === 1 ? '' : 'S'}`);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
        {album.coverArt && (
          <img
            src={album.coverArt}
            alt=""
            aria-hidden
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 p-5 sm:p-7">
          <SmartCover
            src={album.coverArt}
            alt={album.title}
            className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl object-cover shadow-2xl ring-1 ring-white/10 shrink-0"
            iconClassName="h-12 w-12"
          />
          <div className="min-w-0 flex-1 flex flex-col">
            <p className="text-[10px] sm:text-[11px] text-white/55 uppercase tracking-[0.2em] font-medium">
              {metaParts.join(' · ')}
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mt-1 leading-tight">{album.title}</h2>
            <p className="text-sm sm:text-base text-white/80 mt-0.5">{album.artist}</p>

            {(album.label || album.description) && (
              <div className="mt-3 space-y-2">
                {album.label && (
                  <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-white/75 bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm w-fit">
                    <span className="uppercase tracking-widest text-white/45 text-[9px] sm:text-[10px]">Label</span>
                    <span className="font-medium">{album.label}</span>
                  </div>
                )}
                {album.description && (
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line line-clamp-4 max-w-2xl">
                    {album.description}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={playAll}
                disabled={!tracks.length}
                className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                <Play size={12} fill="currentColor" /> Play All
              </button>
              <button
                onClick={shuffle}
                disabled={!tracks.length}
                className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs px-5 py-2 rounded-full border border-white/15 hover:bg-white/15 transition-colors disabled:opacity-40 backdrop-blur-sm"
              >
                <Shuffle size={12} /> Shuffle
              </button>
              <button
                onClick={share}
                aria-label="Share album"
                className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs px-5 py-2 rounded-full border border-white/15 hover:bg-white/15 transition-colors backdrop-blur-sm"
              >
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="text-sm text-white/45 text-center py-10">No tracks on this album yet.</div>
      ) : (
        <div className="space-y-0">
          {tracks.map((song, i) => (
            <div key={song.id} className="border-b border-white/5 last:border-b-0">
              <AppleStyleSongRow song={song} index={i} onSelect={onSelectSong} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;
