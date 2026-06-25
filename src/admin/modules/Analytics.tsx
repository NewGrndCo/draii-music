import React, { useEffect, useMemo, useState } from 'react';
import { adminStats } from '../lib/api';
import StatCard from '../components/StatCard';
import GeographicMap, { FocusTarget } from '../components/GeographicMap';
import ListenLog from '../components/ListenLog';
import PredictiveSection from '../components/PredictiveSection';
import RecentListensChart from '../components/RecentListensChart';
import { Globe2, PlayCircle, Heart, Smartphone, Monitor, Loader2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { useLiveListeners } from '@/hooks/useLivePresence';
import { COUNTRY_COORDS, flagEmoji, toCountryCode } from '../lib/countries';

type Stats = Awaited<ReturnType<typeof adminStats>>;

const Analytics: React.FC = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState<FocusTarget>(null);
  const liveListeners = useLiveListeners();
  const liveCount = liveListeners.length;

  useEffect(() => {
    adminStats().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    if (!data) return null;
    const totalPlays = data.songs.reduce((s, x: any) => s + (x.play_count || 0), 0);
    const totalLikes = data.songs.reduce((s, x: any) => s + (x.likes_count || 0), 0);
    return { totalPlays, totalLikes };
  }, [data]);

  if (loading) {
    return <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;
  }
  if (!data || !totals) return null;

  const devices = data.listens.reduce((acc: Record<string, number>, l: any) => {
    const k = l.device || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const totalDev = Math.max(1, (devices.mobile || 0) + (devices.desktop || 0));

  const sources = data.listens.reduce((acc: Record<string, number>, l: any) => {
    const k = l.source || 'direct';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const totalSrc = Math.max(1, Object.values(sources).reduce<number>((s, v) => s + (v as number), 0));

  const donByType = data.donations.reduce((acc: Record<string, number>, d: any) => {
    acc[d.source] = (acc[d.source] || 0) + (d.amount_cents || 0);
    return acc;
  }, {} as Record<string, number>);
  const donTotal = Object.values(donByType).reduce<number>((s, v) => s + (v as number), 0);

  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const k = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days[k] = 0;
  }
  data.donations.forEach((d: any) => {
    const k = (d.created_at || '').slice(0, 10);
    if (k in days) days[k] += d.amount_cents || 0;
  });
  const trend = Object.values(days);
  const trendMax = Math.max(1, ...trend);

  // Click a live listener → focus the map on their location
  const focusOnListener = (l: any) => {
    const code = toCountryCode(l.country);
    const coords = code ? COUNTRY_COORDS[code] : null;
    if (!coords) {
      toast.info('No coordinates available for this listener.');
      return;
    }
    const label = [l.city, l.region, code].filter(Boolean).join(', ');
    setFocus({ coords, zoom: l.city ? 6 : 4, label: label || 'Listener' });
    // Smooth scroll to the map
    requestAnimationFrame(() => {
      document.getElementById('analytics-geo-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Plays" value={totals.totalPlays.toLocaleString()} icon={PlayCircle} accent="blue" />
        <StatCard label="Total Likes" value={totals.totalLikes.toLocaleString()} icon={Heart} accent="pink" />
        <StatCard label="Live Now" value={liveCount} hint="connected" icon={Radio} accent="purple" />
        <StatCard label="Listens (5k cap)" value={data.listens.length.toLocaleString()} icon={Globe2} accent="blue" />
      </div>

      <div className="admin-glass rounded-2xl p-3 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Radio className="h-4 w-4 text-purple-300" />
            Live listeners
            <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
          </h3>
          <span className="text-xs text-white/45">{liveCount} connected · click to locate on map</span>
        </div>
        {liveCount === 0 ? (
          <div className="text-sm text-white/45 py-6 text-center">No active listeners right now.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {liveListeners.map((l) => {
              const code = toCountryCode(l.country);
              const loc = [l.city, l.region, l.country].filter(Boolean).join(', ');
              const since = Math.max(0, Math.floor((Date.now() - (l.joined_at || Date.now())) / 1000));
              const sinceLabel = since < 60 ? `${since}s` : since < 3600 ? `${Math.floor(since / 60)}m` : `${Math.floor(since / 3600)}h`;
              const playing = l.is_playing;
              return (
                <button
                  key={l.id}
                  onClick={() => focusOnListener(l)}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 px-3 py-2 text-left transition cursor-pointer"
                >
                  {l.cover_art ? (
                    <img src={l.cover_art} alt="" loading="lazy" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                      <PlayCircle className="h-4 w-4 text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${playing ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                      <div className="text-sm text-white truncate">{l.song_title || 'Idle'}</div>
                    </div>
                    <div className="text-xs text-white/55 truncate">{l.song_artist || '—'}</div>
                    {loc && (
                      <div className="text-[10px] text-white/45 truncate flex items-center gap-1 mt-0.5">
                        <span className="text-sm leading-none">{flagEmoji(code)}</span> {loc}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-[10px] uppercase tracking-widest text-white/45 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {l.device === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                      <span className="hidden sm:inline">{l.device || 'web'}</span>
                    </div>
                    <span className="text-white/40 normal-case tracking-normal">{sinceLabel} ago</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <RecentListensChart listens={data.listens as any} />

      <div id="analytics-geo-map">
        <GeographicMap listens={data.listens as any} focus={focus} onClearFocus={() => setFocus(null)} />
      </div>

      <ListenLog listens={data.listens as any} songs={data.songs as any} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="admin-glass rounded-2xl p-3 md:p-5">
          <h3 className="font-display text-base font-semibold mb-4">Support fund &amp; donations</h3>
          <div className="text-3xl font-display font-semibold admin-gradient-text">${(donTotal / 100).toFixed(2)}</div>
          <div className="text-xs text-white/45 mt-1">All-time across all sources</div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {(['stripe', 'crypto', 'pwyw'] as const).map((k) => (
              <div key={k} className="rounded-xl bg-white/[0.04] py-3">
                <div className="text-[10px] uppercase tracking-widest text-white/45">{k === 'pwyw' ? 'Pay-What-You-Want' : k}</div>
                <div className="font-display text-lg mt-1">${((donByType[k] || 0) / 100).toFixed(0)}</div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-widest text-white/45 mb-2">30-day growth</div>
            <div className="flex items-end gap-1 h-20">
              {trend.map((v, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${(v / trendMax) * 100}%`, background: 'var(--admin-gradient)', opacity: 0.5 + 0.5 * (v / trendMax) }} />
              ))}
            </div>
          </div>
        </div>

        <div className="admin-glass rounded-2xl p-3 md:p-5 space-y-6">
          <div>
            <h3 className="font-display text-base font-semibold mb-3">Devices</h3>
            <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
              <div className="h-full" style={{ width: `${((devices.desktop || 0) / totalDev) * 100}%`, background: 'hsl(var(--admin-blue))' }} />
              <div className="h-full" style={{ width: `${((devices.mobile || 0) / totalDev) * 100}%`, background: 'hsl(var(--admin-pink))' }} />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span className="flex items-center gap-1.5"><Monitor className="h-3 w-3" /> Desktop {Math.round(((devices.desktop || 0) / totalDev) * 100)}%</span>
              <span className="flex items-center gap-1.5"><Smartphone className="h-3 w-3" /> Mobile {Math.round(((devices.mobile || 0) / totalDev) * 100)}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold mb-3">Traffic sources</h3>
            <div className="space-y-2">
              {Object.entries(sources).slice(0, 6).map(([s, n]) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-white/55 truncate">{s}</div>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${((n as number) / totalSrc) * 100}%`, background: 'var(--admin-gradient)' }} />
                  </div>
                  <div className="w-12 text-right text-xs text-white/70 tabular-nums">{n as number}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PredictiveSection data={data as any} />
    </div>
  );
};

export default Analytics;
