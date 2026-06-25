import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminList, adminUpdate, adminDelete, adminUploadFile, adminInsert } from '../lib/api';
import { Loader2, Search, Pencil, Trash2, Save, X, Upload, Plus, Music2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Song {
  id: string;
  title: string | null;
  artist: string | null;
  release_date: string | null;
  bpm: number | null;
  play_count: number | null;
  likes_count: number | null;
  support_fund_cents: number | null;
  is_collaboration: boolean;
  guest_artists: string[];
  file_path: string | null;
  thumbnail_path: string | null;
  genre: string | null;
  category: string | null;
  album_id: string | null;
}

const SUPABASE_PUBLIC_BASE = 'https://iextgszxpxeurbpncapv.supabase.co';
const coverUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/lovable-uploads')) return path;
  return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/songs/${path}`;
};

const Library: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Song>>({});

  const refresh = useCallback(() => {
    setLoading(true);
    adminList<Song>('songs')
      .then(setSongs)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Live updates: only subscribe while the tab is visible to avoid
  // unnecessary realtime egress when the admin is in the background.
  useEffect(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    const channel = supabase
      .channel('admin-songs-live')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'songs' },
        (payload: any) => {
          const n = payload.new;
          const o = payload.old ?? {};
          if (!n?.id) return;
          // Skip if neither stat column changed (avoid wasted re-renders/egress reactions)
          if (n.play_count === o.play_count && n.likes_count === o.likes_count) return;
          setSongs((prev) => prev.map((s) => s.id === n.id
            ? { ...s, play_count: n.play_count ?? s.play_count, likes_count: n.likes_count ?? s.likes_count }
            : s));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const [groupBy, setGroupBy] = useState<'all' | 'category'>('category');

  const filtered = songs.filter((s) => {
    if (!q) return true;
    const n = q.toLowerCase();
    return (s.title || '').toLowerCase().includes(n) || (s.artist || '').toLowerCase().includes(n);
  });

  const singles = filtered.filter((s) => (s.category || 'single').toLowerCase() === 'single');
  const projects = filtered.filter((s) => (s.category || 'single').toLowerCase() !== 'single');

  const startEdit = (s: Song) => { setEditing(s.id); setDraft({ ...s }); };
  const cancelEdit = () => { setEditing(null); setDraft({}); };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const payload: any = {
        title: draft.title,
        artist: draft.artist,
        release_date: draft.release_date || null,
        bpm: draft.bpm ? Number(draft.bpm) : null,
        support_fund_cents: draft.support_fund_cents ? Number(draft.support_fund_cents) : 0,
        is_collaboration: !!draft.is_collaboration,
        guest_artists: draft.guest_artists ?? [],
        category: draft.category || 'single',
      };
      const updated = await adminUpdate<Song>('songs', editing, payload);
      setSongs((prev) => prev.map((s) => (s.id === editing ? { ...s, ...updated } : s)));
      cancelEdit();
      toast.success('Saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this song?')) return;
    try {
      await adminDelete('songs', id);
      setSongs((p) => p.filter((s) => s.id !== id));
      toast.success('Deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleCollab = async (s: Song, val: boolean) => {
    try {
      const updated = await adminUpdate<Song>('songs', s.id, { is_collaboration: val });
      setSongs((prev) => prev.map((x) => (x.id === s.id ? { ...x, ...updated } : x)));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const renderTable = (rows: Song[]) => (
    <div className="admin-glass rounded-2xl overflow-hidden">
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-white/45">No songs in this group.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-white/45">
                <tr className="text-left border-b border-white/5">
                  <th className="p-3 w-16"></th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Artist</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Release</th>
                  <th className="p-3 text-right">Plays</th>
                  <th className="p-3 text-right">Likes</th>
                  <th className="p-3 text-right">Support $</th>
                  <th className="p-3">Collab</th>
                  <th className="p-3 w-32"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const isEdit = editing === s.id;
                  const cover = coverUrl(s.thumbnail_path);
                  return (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="p-2 align-middle">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/[0.04] border border-white/5 flex items-center justify-center">
                          {cover
                            ? <img src={cover} alt={s.title || ''} loading="lazy" decoding="async" className="h-full w-full object-cover" />

                            : <Music2 className="h-4 w-4 text-white/30" />}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        {isEdit ? (
                          <Input value={draft.title ?? ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="bg-white/5 border-white/10 h-8 text-white" />
                        ) : (
                          <div className="font-medium">{s.title}</div>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        {isEdit ? (
                          <Input value={draft.artist ?? ''} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} className="bg-white/5 border-white/10 h-8 text-white" />
                        ) : (
                          <span className="text-white/75">{s.artist}</span>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        {isEdit ? (
                          <select
                            value={draft.category ?? 'single'}
                            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-md h-8 px-2 text-xs text-white"
                          >
                            <option value="single">Single</option>
                            <option value="project">Project / EP</option>
                            <option value="album">Album</option>
                          </select>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 capitalize">
                            {s.category || 'single'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 align-top text-white/70">
                        {isEdit ? (
                          <Input type="date" value={(draft.release_date ?? '').toString().slice(0, 10)} onChange={(e) => setDraft({ ...draft, release_date: e.target.value })} className="bg-white/5 border-white/10 h-8 text-white" />
                        ) : s.release_date ? new Date(s.release_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 align-top text-right tabular-nums">{(s.play_count ?? 0).toLocaleString()}</td>
                      <td className="p-3 align-top text-right tabular-nums">{(s.likes_count ?? 0).toLocaleString()}</td>
                      <td className="p-3 align-top text-right tabular-nums">
                        {isEdit ? (
                          <Input type="number" value={((draft.support_fund_cents ?? 0) / 100) as any} onChange={(e) => setDraft({ ...draft, support_fund_cents: Math.round(Number(e.target.value) * 100) })} className="bg-white/5 border-white/10 h-8 w-24 ml-auto text-white" />
                        ) : `$${((s.support_fund_cents ?? 0) / 100).toFixed(2)}`}
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isEdit ? !!draft.is_collaboration : !!s.is_collaboration}
                            onCheckedChange={(v) => isEdit ? setDraft({ ...draft, is_collaboration: v }) : toggleCollab(s, v)}
                          />
                          {(isEdit ? draft.is_collaboration : s.is_collaboration) && (
                            <Input
                              placeholder="guest, guest"
                              value={(isEdit ? (draft.guest_artists ?? []).join(', ') : s.guest_artists.join(', '))}
                              onChange={(e) => isEdit && setDraft({ ...draft, guest_artists: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
                              disabled={!isEdit}
                              className="bg-white/5 border-white/10 h-8 w-40 text-white text-xs"
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex justify-end gap-1">
                          {isEdit ? (
                            <>
                              <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-emerald-300 hover:text-emerald-200"><Save className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-white/60"><X className="h-4 w-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => startEdit(s)} className="h-8 w-8 text-white/70 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => remove(s.id)} className="h-8 w-8 text-rose-300 hover:text-rose-200"><Trash2 className="h-4 w-4" /></Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-white/5">
            {rows.map((s) => {
              const cover = coverUrl(s.thumbnail_path);
              return (
                <div key={s.id} className="p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/[0.04] border border-white/5 shrink-0">
                    {cover
                      ? <img src={cover} alt={s.title || ''} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      : <Music2 className="h-4 w-4 text-white/30 m-auto" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-xs text-white/55 truncate">{s.artist} · {s.category || 'single'}</div>
                  </div>
                  <div className="text-right text-xs text-white/55 shrink-0">
                    <div>{(s.play_count ?? 0).toLocaleString()} plays</div>
                    <Button size="sm" variant="ghost" onClick={() => remove(s.id)} className="text-rose-300 h-7 px-1"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Uploader FIRST */}
      <BulkUploader onUploaded={refresh} />

      <div className="admin-glass rounded-2xl p-4 md:p-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or artist…"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setGroupBy('category')}
            className={`px-3 py-1.5 rounded-full ${groupBy === 'category' ? 'admin-gradient-bg text-white' : 'bg-white/5 text-white/60'}`}
          >
            By type
          </button>
          <button
            onClick={() => setGroupBy('all')}
            className={`px-3 py-1.5 rounded-full ${groupBy === 'all' ? 'admin-gradient-bg text-white' : 'bg-white/5 text-white/60'}`}
          >
            All
          </button>
        </div>
        <div className="text-xs text-white/55">{filtered.length} of {songs.length} songs</div>
      </div>

      {loading ? (
        <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
      ) : groupBy === 'all' ? (
        renderTable(filtered)
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <h3 className="font-display text-sm font-semibold text-white/85">Singles</h3>
              <span className="text-xs text-white/45">{singles.length}</span>
            </div>
            {renderTable(singles)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <h3 className="font-display text-sm font-semibold text-white/85">Projects & Albums</h3>
              <span className="text-xs text-white/45">{projects.length}</span>
            </div>
            {renderTable(projects)}
          </div>
        </div>
      )}
    </div>
  );
};

const BulkUploader: React.FC<{ onUploaded: () => void }> = ({ onUploaded }) => {
  const [items, setItems] = useState<{ file: File; title: string; artist: string; genre: string; status: 'pending' | 'uploading' | 'done' | 'error'; err?: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => /audio\/(mpeg|wav|x-wav|mp3)/i.test(f.type) || /\.(mp3|wav)$/i.test(f.name));
    if (!arr.length) { toast.error('Only MP3 and WAV files'); return; }
    setItems((prev) => [
      ...prev,
      ...arr.map((file) => ({ file, title: file.name.replace(/\.[^.]+$/, ''), artist: 'Draii Rynell', genre: 'R&B/Soul', status: 'pending' as const })),
    ]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const uploadAll = async () => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.status === 'done') continue;
      setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, status: 'uploading' } : x));
      try {
        const ext = it.file.name.split('.').pop() || 'mp3';
        const path = `${crypto.randomUUID()}.${ext}`;
        const publicUrl = await adminUploadFile('song-audio', path, it.file);
        await adminInsert('songs', {
          id: crypto.randomUUID(),
          title: it.title,
          artist: it.artist,
          genre: it.genre,
          file_path: publicUrl,
          status: 'published',
          visibility: 'published',
          category: 'single',
        });
        setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, status: 'done' } : x));
      } catch (e: any) {
        setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, status: 'error', err: e.message } : x));
      }
    }
    toast.success('Upload complete');
    onUploaded();
  };

  return (
    <div className="admin-glass rounded-2xl p-3 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold">Bulk uploader</h3>
          <p className="text-xs text-white/50 mt-0.5">Drop MP3 / WAV files to add multiple songs at once.</p>
        </div>
        {items.length > 0 && (
          <Button onClick={uploadAll} className="admin-gradient-bg text-white border-0 hover:opacity-90"><Upload className="h-4 w-4 mr-2" />Upload {items.length}</Button>
        )}
      </div>

      <label
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        className={`block rounded-xl border-2 border-dashed text-center py-10 cursor-pointer transition-all ${drag ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".mp3,.wav,audio/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <Music2 className="h-8 w-8 mx-auto text-white/35" />
        <div className="mt-3 text-sm text-white/75">Drop audio files here or click to choose</div>
        <div className="text-xs text-white/45 mt-1">MP3, WAV — up to 20 files</div>
      </label>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white/[0.03] rounded-lg p-2 text-sm">
              <div className="col-span-12 md:col-span-3 truncate text-white/80 text-xs">{it.file.name}</div>
              <Input value={it.title} onChange={(e) => setItems((p) => p.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} placeholder="Title" className="col-span-6 md:col-span-3 h-8 bg-white/5 border-white/10 text-white text-xs" />
              <Input value={it.artist} onChange={(e) => setItems((p) => p.map((x, idx) => idx === i ? { ...x, artist: e.target.value } : x))} placeholder="Artist" className="col-span-6 md:col-span-3 h-8 bg-white/5 border-white/10 text-white text-xs" />
              <Input value={it.genre} onChange={(e) => setItems((p) => p.map((x, idx) => idx === i ? { ...x, genre: e.target.value } : x))} placeholder="Genre" className="col-span-8 md:col-span-2 h-8 bg-white/5 border-white/10 text-white text-xs" />
              <div className="col-span-4 md:col-span-1 text-right">
                {it.status === 'pending' && <Plus className="h-4 w-4 ml-auto text-white/40" />}
                {it.status === 'uploading' && <Loader2 className="h-4 w-4 ml-auto animate-spin text-purple-300" />}
                {it.status === 'done' && <span className="text-xs text-emerald-300">Done</span>}
                {it.status === 'error' && <span className="text-xs text-rose-300" title={it.err}>Failed</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
