import React from 'react';
import { Album, Song } from '../../data/musicData';
import { Play, Shuffle, Share2 } from 'lucide-react';
import AppleStyleSongRow from './AppleStyleSongRow';
import { copyToClipboard } from '../../utils/shareUtils';
import { toast } from 'sonner';

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
    const url = `${window.location.origin}?a=${encodeURIComponent(key)}`;
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

  const metaParts = ['ALBUM'];
  if (album.year) metaParts.push(album.year);
  metaParts.push(`${tracks.length} TRACK${tracks.length === 1 ? '' : 'S'}`);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        {album.coverArt && (
          <img
            src={album.coverArt}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 flex items-end gap-4 p-4 sm:p-5">
          <img
            src={album.coverArt}
            alt={album.title}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover shadow-2xl shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{album.title}</h2>
            <p className="text-sm text-white/75 truncate">{album.artist}</p>
            <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest mt-1">
              {metaParts.join(' · ')}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={playAll}
                disabled={!tracks.length}
                className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                <Play size={12} fill="currentColor" /> Play All
              </button>
              <button
                onClick={shuffle}
                disabled={!tracks.length}
                className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs px-4 py-1.5 rounded-full border border-white/15 hover:bg-white/15 transition-colors disabled:opacity-40"
              >
                <Shuffle size={12} /> Shuffle
              </button>
              <button
                onClick={share}
                aria-label="Share album"
                className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs px-4 py-1.5 rounded-full border border-white/15 hover:bg-white/15 transition-colors"
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
