import React, { useMemo } from 'react';
import { TrendingUp, Play } from 'lucide-react';
import { Song } from '@/data/musicData';

interface Props {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

const TrendingSongs: React.FC<Props> = ({ songs, onSelectSong }) => {
  const top = useMemo(() => {
    return [...songs]
      .filter((s) => (s.playCount ?? 0) > 0)
      .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
      .slice(0, 5);
  }, [songs]);

  if (songs.length === 0) return <div aria-hidden className="px-2 h-[240px]" style={{ contain: 'layout paint' }} />;
  if (top.length === 0) return null;

  return (
    <section className="px-2">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={14} className="text-white/70" />
        <h3 className="text-xs uppercase tracking-widest text-white/70 font-medium">Trending</h3>
      </div>
      <ul className="space-y-1.5">
        {top.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => onSelectSong(s)}
              className="w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors group touch-manipulation"
            >
              <span className="text-base font-display text-white/35 w-5 text-center tabular-nums">{i + 1}</span>
              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-white/[0.04] shrink-0">
                {s.coverArt && <img src={s.coverArt} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <Play size={14} className="text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">{s.title}</div>
                <div className="text-[11px] text-white/55 truncate">{s.artist}</div>
              </div>
              <span className="text-[11px] text-white/40 tabular-nums shrink-0">{(s.playCount ?? 0).toLocaleString()} ▶</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default React.memo(TrendingSongs);
