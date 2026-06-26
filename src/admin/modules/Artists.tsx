import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { listTable } from '../lib/musicApi';

interface SA { id: string; song_id: string; name: string; role: 'primary' | 'featured' | 'producer' | 'composer' | 'remixer' }

const Artists: React.FC = () => {
  const [rows, setRows] = useState<SA[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    listTable<SA>('song_artists')
      .then(setRows)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, { name: string; primary: number; featured: number; total: number }>();
    rows.forEach((r) => {
      const key = r.name.trim();
      const cur = m.get(key) || { name: key, primary: 0, featured: 0, total: 0 };
      if (r.role === 'primary') cur.primary++;
      if (r.role === 'featured') cur.featured++;
      cur.total++;
      m.set(key, cur);
    });
    const arr = Array.from(m.values()).sort((a, b) => b.total - a.total);
    const needle = q.trim().toLowerCase();
    return needle ? arr.filter((a) => a.name.toLowerCase().includes(needle)) : arr;
  }, [rows, q]);

  return (
    <div className="space-y-4">
      <div className="admin-glass rounded-2xl p-4">
        <h2 className="font-display text-lg font-semibold">Artists</h2>
        <p className="text-xs text-white/50">All artists referenced by your catalog, derived from song relationships.</p>
      </div>

      <div className="admin-glass rounded-2xl p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search artists…"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9" />
        </div>
      </div>

      {loading ? (
        <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
      ) : (
        <div className="admin-glass rounded-2xl overflow-hidden">
          {grouped.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/45">No artists.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {grouped.map((a) => (
                <li key={a.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center">
                    <User className="h-4 w-4 text-white/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white truncate">{a.name}</div>
                    <div className="text-[11px] text-white/45">{a.total} appearance{a.total === 1 ? '' : 's'}</div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/55">
                    <span>{a.primary} primary</span>
                    <span>{a.featured} feat.</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Artists;
