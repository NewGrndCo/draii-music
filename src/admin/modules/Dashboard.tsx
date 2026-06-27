import React, { useEffect, useState, useMemo } from 'react';
import { adminStats, adminList } from '../lib/api';
import StatCard from '../components/StatCard';
import {
  Music2, Heart, PlayCircle, DollarSign, CalendarDays, ShoppingBag,
  Loader2, Users, Radio, MapPin, Trophy, Megaphone, GripVertical, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLiveListenerCount } from '@/hooks/useLivePresence';

const LAYOUT_KEY = 'admin.dashboard.layout.v1';
const DEFAULT_ORDER = ['top-songs', 'next-events', 'active-merch', 'top-countries', 'live-listeners', 'campaigns'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof adminStats>> | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [merch, setMerch] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const liveListeners = useLiveListenerCount();

  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) {
        // merge in any missing defaults (e.g. new cards added later)
        const merged = [...saved.filter((k: string) => DEFAULT_ORDER.includes(k))];
        DEFAULT_ORDER.forEach((k) => { if (!merged.includes(k)) merged.push(k); });
        return merged;
      }
    } catch {}
    return DEFAULT_ORDER;
  });
  const [dragKey, setDragKey] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminStats(),
      adminList('songs'),
      adminList('events'),
      adminList('merch'),
      adminList('campaigns').catch(() => []),
    ])
      .then(([stats, s, e, m, c]) => {
        setData(stats);
        setSongs(s as any[]);
        setEvents(e as any[]);
        setMerch(m as any[]);
        setCampaigns(c as any[]);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const persistOrder = (next: string[]) => {
    setOrder(next);
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(next)); } catch {}
  };
  const resetOrder = () => {
    setOrder(DEFAULT_ORDER);
    try { localStorage.removeItem(LAYOUT_KEY); } catch {}
  };
  const onDragStart = (key: string) => setDragKey(key);
  const onDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (!dragKey || dragKey === key) return;
    const next = order.filter((k) => k !== dragKey);
    next.splice(next.indexOf(key), 0, dragKey);
    setOrder(next);
  };
  const onDragEnd = () => { persistOrder(order); setDragKey(null); };

  if (loading) {
    return (
      <div className="admin-glass rounded-2xl p-12 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-white/50" />
      </div>
    );
  }
  if (!data) return null;

  const totalPlays = data.songs.reduce((s, x: any) => s + (x.play_count || 0), 0);
  const totalLikes = data.songs.reduce((s, x: any) => s + (x.likes_count || 0), 0);
  const supportFund = data.songs.reduce((s, x: any) => s + (x.support_fund_cents || 0), 0)
                    + data.donations.reduce((s, x: any) => s + (x.amount_cents || 0), 0);
  const upcoming = (events || [])
    .filter((e: any) => e.status === 'active' && new Date(e.event_date) >= new Date(new Date().toDateString()))
    .sort((a: any, b: any) => a.event_date.localeCompare(b.event_date));
  const activeMerch = (merch || []).filter((m: any) => m.active);

  const topSongs = [...(songs || [])]
    .sort((a: any, b: any) => (b.play_count || 0) - (a.play_count || 0))
    .slice(0, 5);

  const recentListens = data.listens.length;
  const countryCounts: Record<string, number> = {};
  data.listens.forEach((l: any) => {
    const c = l.country || 'Unknown';
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        <StatCard label="Live now"       value={liveListeners} icon={Radio} accent="pink" />
        <StatCard label="Songs"          value={data.songs.length} icon={Music2} />
        <StatCard label="Total Plays"    value={totalPlays.toLocaleString()} icon={PlayCircle} accent="blue" />
        <StatCard label="Total Likes"    value={totalLikes.toLocaleString()} icon={Heart} accent="pink" />
        <StatCard label="Support Fund"   value={`$${(supportFund / 100).toFixed(2)}`} icon={DollarSign} accent="purple" />
        <StatCard label="Upcoming Shows" value={upcoming.length} icon={CalendarDays} accent="blue" />
        <StatCard label="Active Merch"   value={activeMerch.length} icon={ShoppingBag} accent="pink" />
      </div>

      {/* Recent listens spark */}
      <div className="admin-glass rounded-2xl p-3 md:p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold">Recent listens (24h)</h3>
          <span className="text-xs text-white/50">{recentListens.toLocaleString()} captured</span>
        </div>
        <ListensSpark listens={data.listens} />
      </div>

      {/* Rearrangeable card grid */}
      {(() => {
        const totalScans = (campaigns || []).reduce((s, c: any) => s + (c.scan_count || 0), 0);
        const activeCampaigns = (campaigns || []).filter((c: any) => c.active !== false);
        const topCampaigns = [...(campaigns || [])]
          .sort((a: any, b: any) => (b.scan_count || 0) - (a.scan_count || 0))
          .slice(0, 4);

        const cards: Record<string, { title: string; icon: any; node: React.ReactNode }> = {
          'top-songs': {
            title: 'Top songs', icon: Trophy,
            node: topSongs.length === 0 ? (
              <div className="text-sm text-white/45 py-6 text-center">No songs yet.</div>
            ) : (
              <div className="space-y-2">
                {topSongs.map((s: any, i) => (
                  <div key={s.id} className="flex items-center gap-3 text-sm">
                    <div className="w-5 text-right text-white/45 tabular-nums">{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{s.title}</div>
                      <div className="text-xs text-white/50 truncate">{s.artist}</div>
                    </div>
                    <div className="text-xs text-white/55 tabular-nums">{(s.play_count ?? 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ),
          },
          'next-events': {
            title: 'Next events', icon: CalendarDays,
            node: upcoming.length === 0 ? (
              <div className="text-sm text-white/45 py-6 text-center">Nothing upcoming.</div>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 5).map((e: any) => (
                  <div key={e.id} className="rounded-xl bg-white/[0.04] border border-white/5 px-3 py-2">
                    <div className="text-xs text-purple-200/80">
                      {new Date(e.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ''}
                    </div>
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    {e.location && <div className="text-xs text-white/50 truncate">{e.location}</div>}
                  </div>
                ))}
              </div>
            ),
          },
          'active-merch': {
            title: 'Active merch', icon: ShoppingBag,
            node: activeMerch.length === 0 ? (
              <div className="text-sm text-white/45 py-6 text-center">No active products.</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {activeMerch.slice(0, 6).map((m: any) => (
                  <div key={m.id} className="rounded-lg bg-white/[0.04] border border-white/5 overflow-hidden">
                    <div className="aspect-square bg-white/[0.03]">
                      {m.image_url && <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-1.5">
                      <div className="text-[11px] truncate">{m.name}</div>
                      <div className="text-[10px] text-white/55">${((m.price_cents ?? 0) / 100).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          'top-countries': {
            title: 'Top listener countries', icon: MapPin,
            node: topCountries.length === 0 ? (
              <div className="text-sm text-white/45 py-6 text-center">No location data yet.</div>
            ) : (
              <div className="space-y-2">
                {topCountries.map(([country, n]) => {
                  const pct = (n / topCountries[0][1]) * 100;
                  return (
                    <div key={country}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/75">{country}</span>
                        <span className="text-white/55 tabular-nums">{n}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full admin-gradient-bg" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ),
          },
          'live-listeners': {
            title: 'Live listeners', icon: Users,
            node: (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-5xl font-display font-bold admin-gradient-text">{liveListeners}</div>
                  <div className="text-xs text-white/50 mt-2">Connected right now via realtime presence</div>
                </div>
              </div>
            ),
          },
          'campaigns': {
            title: 'Campaigns', icon: Megaphone,
            node: (campaigns || []).length === 0 ? (
              <div className="text-sm text-white/45 py-6 text-center">No campaigns yet.</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/55">{activeCampaigns.length} active</span>
                  <span className="text-white/55 tabular-nums">{totalScans.toLocaleString()} total scans</span>
                </div>
                <div className="space-y-2">
                  {topCampaigns.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{c.name || c.code}</div>
                        <div className="text-xs text-white/50 truncate">/{c.code}</div>
                      </div>
                      <div className="text-xs text-white/55 tabular-nums">{(c.scan_count ?? 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-xs text-white/45 flex items-center gap-1.5">
                <GripVertical className="h-3.5 w-3.5" /> Drag cards to rearrange
              </div>
              <button
                onClick={resetOrder}
                className="text-xs text-white/55 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset layout
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {order.map((key) => {
                const c = cards[key];
                if (!c) return null;
                const Icon = c.icon;
                const isDragging = dragKey === key;
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => onDragStart(key)}
                    onDragOver={(e) => onDragOver(e, key)}
                    onDragEnd={onDragEnd}
                    className={`admin-glass rounded-2xl p-3 md:p-5 transition-all ${isDragging ? 'opacity-50 scale-[0.98]' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="h-3.5 w-3.5 text-white/30 cursor-grab active:cursor-grabbing" />
                      <Icon className="h-4 w-4 text-purple-300" />
                      <h3 className="font-display text-base font-semibold">{c.title}</h3>
                    </div>
                    {c.node}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};


const fmtHour12 = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true }).replace(/\s/, '');

const ListensSpark: React.FC<{ listens: any[] }> = ({ listens }) => {
  const now = Date.now();
  const buckets = new Array(24).fill(0);
  listens.forEach((l) => {
    const t = new Date(l.created_at).getTime();
    const hoursAgo = Math.floor((now - t) / 3.6e6);
    if (hoursAgo >= 0 && hoursAgo < 24) buckets[23 - hoursAgo]++;
  });
  const max = Math.max(1, ...buckets);
  return (
    <div>
      <div className="flex items-end gap-1 h-24">
        {buckets.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md transition-all relative group"
            style={{
              height: `${(v / max) * 100}%`,
              background: 'var(--admin-gradient)',
              opacity: 0.4 + (v / max) * 0.6,
            }}
            title={`${v} plays`}
          />
        ))}
      </div>
      <div className="flex gap-1 mt-1.5">
        {buckets.map((_, i) => {
          const d = new Date(now - (23 - i) * 3.6e6);
          const label = fmtHour12(d);
          // Show label every 3 hours to avoid crowding
          const showLabel = i % 3 === 0;
          return (
            <div key={i} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[9px] text-white/40 tabular-nums">{label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
