import React, { useEffect, useMemo, useState } from 'react';
import { adminStats } from '../lib/api';
import { Loader2, Users, Megaphone, MessageSquareQuote, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { flagEmoji, toCountryCode, countryName } from '../lib/countries';

type Stats = Awaited<ReturnType<typeof adminStats>>;

const ArtistOutreach: React.FC = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Campaign filters
  const [filterCity, setFilterCity] = useState('');
  const [filterSong, setFilterSong] = useState('');

  useEffect(() => {
    adminStats().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const songMap = useMemo(() => {
    const m = new Map<string, any>();
    (data?.songs ?? []).forEach((s: any) => m.set(s.id, s));
    return m;
  }, [data]);

  // ── Superfan finder: subscribers whose city has the most listens overall
  const superfans = useMemo(() => {
    if (!data) return [];
    const cityListens: Record<string, number> = {};
    data.listens.forEach((l: any) => {
      if (l.city) cityListens[l.city] = (cityListens[l.city] || 0) + 1;
    });
    return data.mailing
      .map((m: any) => ({
        ...m,
        cityListens: m.city ? cityListens[m.city] || 0 : 0,
        engagement:
          (m.city ? cityListens[m.city] || 0 : 0) +
          // a subscriber who left contact info is itself a strong signal
          (m.email ? 5 : 0) + (m.phone ? 5 : 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 25);
  }, [data]);

  // ── Audience segments for the campaign generator
  const segments = useMemo(() => {
    if (!data) return [];
    const cities: Record<string, { city: string; country?: string; count: number; songIds: Record<string, number> }> = {};
    data.listens.forEach((l: any) => {
      if (!l.city) return;
      cities[l.city] ??= { city: l.city, country: toCountryCode(l.country) || (l.country ?? undefined), count: 0, songIds: {} };
      cities[l.city].count++;
      if (l.song_id) cities[l.city].songIds[l.song_id] = (cities[l.city].songIds[l.song_id] || 0) + 1;
    });
    return Object.values(cities)
      .map((c) => {
        const topSongId = Object.entries(c.songIds).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topSong = topSongId ? songMap.get(topSongId) : null;
        return { ...c, topSong };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [data, songMap]);

  // ── Personalization shoutouts: per superfan
  const shoutout = (m: any) => {
    const songName = m.cityListens
      ? (() => {
          // most-played song in this fan's city
          const counts: Record<string, number> = {};
          (data?.listens ?? []).forEach((l: any) => {
            if (l.city === m.city && l.song_id) counts[l.song_id] = (counts[l.song_id] || 0) + 1;
          });
          const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
          return top ? songMap.get(top)?.title : null;
        })()
      : null;
    const place = [m.city, m.region].filter(Boolean).join(', ');
    return `Hey ${m.email?.split('@')[0] ?? 'friend'} 👋  Big love from the studio${place ? ` to everyone in ${place}` : ''}.${songName ? ` "${songName}" has been on heavy rotation around your area — new music coming soon. — Draii` : ' New music dropping soon. — Draii'}`;
  };

  const filteredSegments = segments.filter(
    (s) =>
      (!filterCity || s.city.toLowerCase().includes(filterCity.toLowerCase())) &&
      (!filterSong || s.topSong?.title?.toLowerCase().includes(filterSong.toLowerCase())),
  );

  const campaignTemplate = (s: any) => ({
    subject: `🔥 ${s.city}, this one's for you`,
    body: `Yo ${s.city} — saw you tuning in${s.topSong ? ` to "${s.topSong.title}"` : ''}. Limited drop coming. Be the first to hear it. Reply to this email or hit the site to lock in early access.\n\n— Draii`,
  });

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  if (loading) return <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Superfan finder */}
      <section className="admin-glass rounded-2xl p-3 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Superfan Finder</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Mailing-list subscribers ranked by engagement signals from their city's listen activity.</p>
        {superfans.length === 0 ? (
          <div className="text-sm text-white/45 py-6 text-center">No mailing-list signups yet.</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-white/45">
                  <th className="text-left px-2 py-2">Rank</th>
                  <th className="text-left px-2 py-2">Email</th>
                  <th className="text-left px-2 py-2">Location</th>
                  <th className="text-right px-2 py-2">City plays</th>
                  <th className="text-right px-2 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {superfans.map((m, i) => {
                  const code = toCountryCode(m.country);
                  return (
                    <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                      <td className="px-2 py-2 text-white/55">#{i + 1}</td>
                      <td className="px-2 py-2 text-white truncate max-w-[220px]">{m.email}</td>
                      <td className="px-2 py-2 text-white/65 text-xs">
                        <span className="mr-1">{flagEmoji(code as any)}</span>
                        {[m.city, m.region, code ? countryName(code as any) : m.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-white/70">{m.cityListens}</td>
                      <td className="px-2 py-2 text-right tabular-nums admin-gradient-text font-semibold">{m.engagement}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Campaign generator */}
      <section className="admin-glass rounded-2xl p-3 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Campaign Generator</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Audience segments with ready-to-send subject lines and bodies. Filter by city or song to target specific fans.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            placeholder="Filter city (e.g. Brooklyn)"
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-purple-300/50"
          />
          <input
            value={filterSong}
            onChange={(e) => setFilterSong(e.target.value)}
            placeholder="Filter top track"
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-purple-300/50"
          />
        </div>
        {filteredSegments.length === 0 ? (
          <div className="text-sm text-white/45 py-6 text-center">No matching segments.</div>
        ) : (
          <div className="space-y-2">
            {filteredSegments.map((s) => {
              const tpl = campaignTemplate(s);
              const fullText = `${tpl.subject}\n\n${tpl.body}`;
              return (
                <div key={s.city} className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="text-sm text-white flex items-center gap-2">
                      <span>{flagEmoji(s.country as any)}</span>
                      <span className="font-semibold">{s.city}</span>
                      <span className="text-white/45 text-xs">· {s.count} plays{s.topSong ? ` · top: ${s.topSong.title}` : ''}</span>
                    </div>
                    <button
                      onClick={() => copy(fullText, `c-${s.city}`)}
                      className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/70 flex items-center gap-1"
                    >
                      {copiedId === `c-${s.city}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedId === `c-${s.city}` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-xs text-purple-200 font-semibold mb-1">{tpl.subject}</div>
                  <div className="text-xs text-white/65 whitespace-pre-line">{tpl.body}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Personalization engine */}
      <section className="admin-glass rounded-2xl p-3 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareQuote className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Personalization Engine</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Per-fan shout-outs that reference their city's most-played track. Click to copy.</p>
        {superfans.length === 0 ? (
          <div className="text-sm text-white/45 py-6 text-center">Need subscribers to generate shout-outs.</div>
        ) : (
          <div className="space-y-2">
            {superfans.slice(0, 10).map((m) => {
              const text = shoutout(m);
              return (
                <button
                  key={m.id}
                  onClick={() => copy(text, `p-${m.id}`)}
                  className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 p-3 transition flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/55 mb-1 truncate">{m.email} · {m.city || 'Unknown'}</div>
                    <div className="text-sm text-white/85">{text}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/55 flex items-center gap-1 flex-shrink-0">
                    {copiedId === `p-${m.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedId === `p-${m.id}` ? 'Copied' : 'Copy'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtistOutreach;
