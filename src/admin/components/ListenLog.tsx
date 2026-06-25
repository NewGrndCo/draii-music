import React, { useMemo, useState } from 'react';
import { Clock, Globe2, Smartphone, Monitor, Music2 } from 'lucide-react';
import { flagEmoji, toCountryCode, countryName } from '../lib/countries';

type Listen = {
  song_id?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  device?: string | null;
  source?: string | null;
  created_at?: string;
};

type Song = { id: string; title?: string; artist?: string };

type Range = 'day' | 'week' | 'ytd';
const RANGES: { id: Range; label: string }[] = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: '7d' },
  { id: 'ytd', label: 'YTD' },
];

const cutoff = (r: Range) => {
  const now = new Date();
  if (r === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (r === 'week') return now.getTime() - 7 * 86400000;
  return new Date(now.getFullYear(), 0, 1).getTime();
};

const fmt = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
};

interface Props {
  listens: Listen[];
  songs: Song[];
}

const ListenLog: React.FC<Props> = ({ listens, songs }) => {
  const [range, setRange] = useState<Range>('week');
  const songMap = useMemo(() => {
    const m = new Map<string, Song>();
    songs.forEach((s) => m.set(s.id, s));
    return m;
  }, [songs]);

  const filtered = useMemo(() => {
    const c = cutoff(range);
    return listens.filter((l) => l.created_at && new Date(l.created_at).getTime() >= c);
  }, [listens, range]);

  return (
    <div className="admin-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-display text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-300" /> Listen log
        </h3>
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1 text-xs rounded-md transition ${
                range === r.id ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
              }`}
            >
              {r.label}
            </button>
          ))}
          <span className="px-2 text-[10px] text-white/40 tabular-nums">{filtered.length}</span>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-white/45 py-8 text-center">No listens in this range yet.</div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-1 space-y-1.5">
          {filtered.map((l, i) => {
            const code = toCountryCode(l.country);
            const loc = [l.city, l.region, code ? countryName(code) : l.country]
              .filter(Boolean)
              .join(', ') || 'Unknown';
            const song = l.song_id ? songMap.get(l.song_id) : undefined;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-2 text-xs transition"
              >
                <span className="text-base leading-none flex-shrink-0">{flagEmoji(code)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-white/90 truncate">
                    <Music2 className="h-3 w-3 text-purple-300 flex-shrink-0" />
                    <span className="truncate">{song?.title || '—'}</span>
                    {song?.artist && <span className="text-white/40 truncate">· {song.artist}</span>}
                  </div>
                  <div className="text-[11px] text-white/50 truncate flex items-center gap-1 mt-0.5">
                    <Globe2 className="h-2.5 w-2.5" /> {loc}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1 flex-shrink-0">
                  {l.device === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                </div>
                <div className="text-[10px] text-white/40 tabular-nums flex-shrink-0 w-24 text-right">
                  {fmt(l.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListenLog;
