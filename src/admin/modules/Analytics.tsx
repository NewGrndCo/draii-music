import React, { useEffect, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { adminStats } from '../lib/api';
import { supabase } from '@/integrations/supabase/client';
import StatCard from '../components/StatCard';
import { Globe2, PlayCircle, Heart, Users, Smartphone, Monitor, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// World topojson (lightweight, public CDN)
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Approximate centroids for common ISO-3166 alpha-2 codes (longitude, latitude)
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [-98, 39], CA: [-106, 56], MX: [-102, 23], BR: [-52, -10], AR: [-64, -34],
  GB: [-2, 54], FR: [2, 46], DE: [10, 51], ES: [-4, 40], IT: [12, 42], NL: [5, 52],
  SE: [15, 62], NO: [10, 62], FI: [26, 64], PL: [19, 52], UA: [32, 49], RU: [100, 61],
  TR: [35, 39], EG: [30, 26], NG: [8, 9], ZA: [24, -29], KE: [37, -1], MA: [-7, 32],
  IN: [78, 22], CN: [104, 35], JP: [138, 36], KR: [127, 36], ID: [113, -2], PH: [121, 12],
  AU: [134, -25], NZ: [172, -41], SA: [45, 24], AE: [54, 24], IL: [35, 31],
};


type Stats = Awaited<ReturnType<typeof adminStats>>;

const Analytics: React.FC = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNow, setActiveNow] = useState(0);

  useEffect(() => {
    adminStats().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-listens')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listens' }, () => {
        setActiveNow((n) => n + 1);
        setTimeout(() => setActiveNow((n) => Math.max(0, n - 1)), 60_000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  const byCountry: Record<string, number> = {};
  data.listens.forEach((l: any) => {
    const c = l.country || 'Unknown';
    byCountry[c] = (byCountry[c] || 0) + 1;
  });
  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCountry = topCountries[0]?.[1] ?? 1;

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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Plays" value={totals.totalPlays.toLocaleString()} icon={PlayCircle} accent="blue" />
        <StatCard label="Total Likes" value={totals.totalLikes.toLocaleString()} icon={Heart} accent="pink" />
        <StatCard label="Active Now" value={activeNow} hint="last 60s" icon={Users} accent="purple" />
        <StatCard label="Listens (5k cap)" value={data.listens.length.toLocaleString()} icon={Globe2} accent="blue" />
      </div>

      <div className="admin-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2"><Globe2 className="h-4 w-4 text-purple-300" /> Geographic listenership</h3>
          <span className="text-xs text-white/45">{Object.keys(byCountry).length} countries</span>
        </div>
        {topCountries.length === 0 ? (
          <div className="text-sm text-white/45 py-8 text-center">No listens yet — once visitors play songs, their countries will appear here.</div>
        ) : (
          <div className="space-y-2">
            {topCountries.map(([country, n]) => (
              <div key={country} className="flex items-center gap-3">
                <div className="w-12 text-xs text-white/55 tabular-nums">{country}</div>
                <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(n / maxCountry) * 100}%`, background: 'var(--admin-gradient)' }}
                  />
                </div>
                <div className="w-14 text-right text-xs tabular-nums text-white/70">{n.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="admin-glass rounded-2xl p-5">
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

        <div className="admin-glass rounded-2xl p-5 space-y-6">
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
    </div>
  );
};

export default Analytics;
