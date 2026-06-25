import React, { useMemo } from 'react';
import { MapPin, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { flagEmoji, toCountryCode, countryName } from '../lib/countries';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  data: {
    listens: any[];
    mailing: any[];
    songs: any[];
    merch: any[];
    merch_clicks: any[];
  };
}

const weekStart = (d: Date) => {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().slice(0, 10);
};

const PredictiveSection: React.FC<Props> = ({ data }) => {
  const touring = useMemo(() => {
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
      .map((c) => ({ ...c, score: c.listens + c.subscribers * 5 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [data]);

  const merchDemand = useMemo(() => {
    const clicksByMerch: Record<string, number> = {};
    data.merch_clicks.forEach((c: any) => {
      if (!c.merch_id) return;
      clicksByMerch[c.merch_id] = (clicksByMerch[c.merch_id] || 0) + 1;
    });
    const totalPlays = data.songs.reduce((s: number, x: any) => s + (x.play_count || 0), 0) || 1;
    return data.merch
      .map((m: any) => {
        const clicks = clicksByMerch[m.id] || 0;
        return { id: m.id, name: m.name || 'Untitled', clicks, score: clicks * 10 + Math.round((totalPlays * 0.001)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [data]);

  const growth = useMemo(() => {
    const buckets: Record<string, number> = {};
    data.mailing.forEach((m: any) => {
      if (!m.created_at) return;
      const w = weekStart(new Date(m.created_at));
      buckets[w] = (buckets[w] || 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, count]) => ({ week, count }));
  }, [data]);

  return (
    <div className="space-y-5">
      <section className="admin-glass rounded-2xl p-3 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Predictive insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/55 mb-2">
              <MapPin className="h-3 w-3" /> Top touring cities
            </div>
            {touring.length === 0 ? (
              <div className="text-sm text-white/45 py-3">Not enough geo data yet.</div>
            ) : (
              <ol className="space-y-2">
                {touring.map((c, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                    <span className="text-lg">{flagEmoji(c.country as any)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{c.city}{c.region ? `, ${c.region}` : ''}</div>
                      <div className="text-[10px] text-white/45">{countryName(c.country as any) || c.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm admin-gradient-text font-display">{c.score}</div>
                      <div className="text-[10px] text-white/45">{c.listens} plays · {c.subscribers} subs</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/55 mb-2">
              <ShoppingBag className="h-3 w-3" /> Merch demand
            </div>
            {merchDemand.length === 0 ? (
              <div className="text-sm text-white/45 py-3">No merch tracked yet.</div>
            ) : (
              <ol className="space-y-2">
                {merchDemand.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                    <div className="flex-1 min-w-0 text-sm text-white truncate">{m.name}</div>
                    <div className="text-xs text-white/55">{m.clicks} clicks</div>
                    <div className="text-sm admin-gradient-text font-display tabular-nums">{m.score}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/55 mb-2">
            <TrendingUp className="h-3 w-3" /> Fan growth — last 8 weeks
          </div>
          {growth.length === 0 ? (
            <div className="text-sm text-white/45 py-3">No mailing-list signups yet.</div>
          ) : (
            <div className="h-44">
              <ResponsiveContainer>
                <LineChart data={growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--admin-purple))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PredictiveSection;
