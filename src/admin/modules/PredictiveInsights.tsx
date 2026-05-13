import React, { useEffect, useMemo, useState } from 'react';
import { adminStats } from '../lib/api';
import { Loader2, MapPin, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { flagEmoji, toCountryCode, countryName } from '../lib/countries';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Stats = Awaited<ReturnType<typeof adminStats>>;

const dayKey = (iso: string) => (iso || '').slice(0, 10);
const weekStart = (d: Date) => {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().slice(0, 10);
};

const PredictiveInsights: React.FC = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStats().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  // ── Touring predictor: top cities by listen density (boost where mailing list signups overlap)
  const touring = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, { city: string; region?: string; country?: string; listens: number; subscribers: number }> = {};
    data.listens.forEach((l: any) => {
      if (!l.city) return;
      const code = toCountryCode(l.country);
      const k = `${l.city}|${l.region || ''}|${code || ''}`;
      counts[k] ??= { city: l.city, region: l.region, country: code || l.country, listens: 0, subscribers: 0 };
      counts[k].listens++;
    });
    data.mailing.forEach((m: any) => {
      if (!m.city) return;
      const code = toCountryCode(m.country);
      const k = `${m.city}|${m.region || ''}|${code || ''}`;
      counts[k] ??= { city: m.city, region: m.region, country: code || m.country, listens: 0, subscribers: 0 };
      counts[k].subscribers++;
    });
    return Object.values(counts)
      // weighted score — subscribers are stronger intent than passive plays
      .map((c) => ({ ...c, score: c.listens + c.subscribers * 5 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [data]);

  // ── Merch demand engine: combine play counts with merch clicks
  const merchDemand = useMemo(() => {
    if (!data) return [];
    const clicksByMerch: Record<string, number> = {};
    data.merch_clicks.forEach((c: any) => {
      if (!c.merch_id) return;
      clicksByMerch[c.merch_id] = (clicksByMerch[c.merch_id] || 0) + 1;
    });
    const totalPlays = data.songs.reduce((s: number, x: any) => s + (x.play_count || 0), 0) || 1;
    return data.merch
      .map((m: any) => {
        const clicks = clicksByMerch[m.id] || 0;
        const stockHealth = m.stock <= 0 ? 'Out of stock' : m.stock < 5 ? 'Low' : 'OK';
        // demand score = clicks weighted, plus a baseline from average play activity
        const score = clicks * 10 + (totalPlays / Math.max(1, data.merch.length)) * 0.001;
        return {
          name: m.name,
          image: m.image_url,
          clicks,
          stock: m.stock,
          stockHealth,
          score: Math.round(score),
          recommend: clicks > 0 && m.stock < 5 ? 'Restock' : clicks === 0 ? 'Promote' : 'Strong',
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [data]);

  // ── Fan growth forecaster: WoW unique-region growth
  const growth = useMemo(() => {
    if (!data) return { hotspots: [] as any[], series: [] as any[] };
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    const buckets: Record<string, { thisWeek: Set<string>; lastWeek: Set<string> }> = {};
    data.listens.forEach((l: any) => {
      const where = [l.city, l.region, toCountryCode(l.country) || l.country].filter(Boolean).join(', ');
      if (!where) return;
      const t = new Date(l.created_at).getTime();
      const id = `${where}|${l.song_id || ''}`; // proxy for unique listener
      buckets[where] ??= { thisWeek: new Set(), lastWeek: new Set() };
      if (t >= thisWeekStart.getTime()) buckets[where].thisWeek.add(id);
      else if (t >= lastWeekStart.getTime() && t < thisWeekStart.getTime()) buckets[where].lastWeek.add(id);
    });
    const hotspots = Object.entries(buckets)
      .map(([where, b]) => {
        const tw = b.thisWeek.size;
        const lw = b.lastWeek.size;
        const delta = tw - lw;
        const pct = lw > 0 ? Math.round(((tw - lw) / lw) * 100) : tw > 0 ? 100 : 0;
        return { where, thisWeek: tw, lastWeek: lw, delta, pct };
      })
      .filter((h) => h.thisWeek > 0)
      .sort((a, b) => b.delta - a.delta || b.pct - a.pct)
      .slice(0, 6);

    // 8-week timeseries of total unique-where listens
    const series: { week: string; listens: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const k = weekStart(d);
      series.push({ week: k.slice(5), listens: 0 });
    }
    data.listens.forEach((l: any) => {
      const k = weekStart(new Date(l.created_at)).slice(5);
      const row = series.find((s) => s.week === k);
      if (row) row.listens++;
    });
    return { hotspots, series };
  }, [data]);

  if (loading) {
    return <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;
  }
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Touring predictor */}
      <section className="admin-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Touring &amp; Performance Predictor</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Top 5 cities to consider for a live show — weighted by listens + mailing-list signups.</p>
        {touring.length === 0 ? (
          <div className="text-sm text-white/45 py-6 text-center">Not enough city-level listen data yet. Hotspots will surface once fans tune in.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {touring.map((c, i) => (
              <div key={c.city + i} className="rounded-xl bg-white/[0.04] border border-white/5 p-3 hover:border-purple-300/30 transition">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl leading-none">{flagEmoji(c.country as any)}</span>
                  <div className="text-[10px] uppercase tracking-widest admin-gradient-text font-semibold">#{i + 1}</div>
                </div>
                <div className="text-sm font-semibold text-white truncate">{c.city}</div>
                <div className="text-[11px] text-white/50 truncate">{[c.region, c.country && countryName(c.country as any)].filter(Boolean).join(', ')}</div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-white/55">
                  <span>{c.listens} plays</span>
                  <span>{c.subscribers} subs</span>
                </div>
                <div className="mt-1 text-[11px] font-display admin-gradient-text">Score {c.score}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Merch demand */}
      <section className="admin-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Merch Demand Engine</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Cross-references store clicks with stock levels to flag what to restock or launch next.</p>
        {merchDemand.length === 0 ? (
          <div className="text-sm text-white/45 py-6 text-center">No merch in store yet — add items to see demand signals.</div>
        ) : (
          <>
            <div className="h-56 mb-4">
              <ResponsiveContainer>
                <BarChart data={merchDemand.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Bar dataKey="clicks" fill="hsl(var(--admin-purple))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {merchDemand.slice(0, 6).map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                  {m.image ? (
                    <img src={m.image} alt="" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-white/5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{m.name}</div>
                    <div className="text-[11px] text-white/50">
                      {m.clicks} clicks · stock {m.stock}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                      m.recommend === 'Restock' ? 'bg-pink-500/15 text-pink-300' :
                      m.recommend === 'Promote' ? 'bg-blue-500/15 text-blue-300' :
                      'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {m.recommend}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Fan growth */}
      <section className="admin-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Fan Growth Forecaster</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Regions with the fastest week-over-week growth in unique listeners — your next hot spots.</p>
        <div className="h-44 mb-4">
          <ResponsiveContainer>
            <LineChart data={growth.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="listens" stroke="hsl(var(--admin-pink))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {growth.hotspots.length === 0 ? (
          <div className="text-sm text-white/45 py-4 text-center">Need at least two weeks of listens to compute growth.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {growth.hotspots.map((h) => (
              <div key={h.where} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-3 w-3 text-purple-300 flex-shrink-0" />
                  <span className="truncate text-white/85">{h.where}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-white/55 tabular-nums">{h.thisWeek} vs {h.lastWeek}</span>
                  <span className={`tabular-nums font-semibold ${h.pct >= 0 ? 'text-emerald-300' : 'text-pink-300'}`}>
                    {h.pct >= 0 ? '+' : ''}{h.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PredictiveInsights;
