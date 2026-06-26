import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { listTable, insertRow, deleteRow, slugify, Genre } from '../lib/musicApi';

const Genres: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [songGenres, setSongGenres] = useState<{ song_id: string; genre_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const refresh = () => {
    setLoading(true);
    Promise.all([
      listTable<Genre>('genres'),
      listTable<{ song_id: string; genre_id: string }>('song_genres'),
    ]).then(([g, sg]) => { setGenres(g); setSongGenres(sg); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const row = await insertRow<Genre>('genres', { name: trimmed, slug: slugify(trimmed) });
      setGenres((p) => [row, ...p]);
      setName('');
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this genre? Song links will be removed.')) return;
    try { await deleteRow('genres', id); setGenres((p) => p.filter((g) => g.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const countFor = (gid: string) => songGenres.filter((s) => s.genre_id === gid).length;

  return (
    <div className="space-y-4">
      <div className="admin-glass rounded-2xl p-4">
        <h2 className="font-display text-lg font-semibold">Genres</h2>
        <p className="text-xs text-white/50">Normalized taxonomy. Multiple genres per song supported.</p>
      </div>

      <div className="admin-glass rounded-2xl p-3 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New genre name…"
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9" />
        <Button onClick={add} className="admin-gradient-bg"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>

      {loading ? (
        <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
      ) : (
        <div className="admin-glass rounded-2xl overflow-hidden">
          {genres.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/45">No genres yet.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {genres.map((g) => (
                <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                  <Tag className="h-4 w-4 text-white/45" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white">{g.name}</div>
                    <div className="text-[11px] text-white/45">{g.slug}</div>
                  </div>
                  <div className="text-[11px] text-white/45">{countFor(g.id)} songs</div>
                  <button onClick={() => remove(g.id)} className="p-1.5 text-rose-300/70 hover:text-rose-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Genres;
