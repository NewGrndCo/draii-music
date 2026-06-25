import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminList, adminUpdate, adminDelete, adminUploadFile, adminInsert } from '../lib/api';
import { Loader2, Search, Pencil, Trash2, Upload, Plus, Music2, Eye, EyeOff, Play, Pause, ChevronDown, ChevronRight, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  hidden: boolean;
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
  const [filter, setFilter] = useState<'all' | 'singles' | 'projects' | 'collabs' | 'hidden'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Song | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    adminList<Song>('songs').then(setSongs).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    const channel = supabase
      .channel('admin-songs-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'songs' }, (payload: any) => {
        const n = payload.new; const o = payload.old ?? {};
        if (!n?.id) return;
        if (n.play_count === o.play_count && n.likes_count === o.likes_count && n.hidden === o.hidden) return;
        setSongs((prev) => prev.map((s) => (s.id === n.id ? { ...s, ...n } : s)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return songs.filter((s) => {
      if (needle && !((s.title || '').toLowerCase().includes(needle) || (s.artist || '').toLowerCase().includes(needle))) return false;
      const cat = (s.category || 'single').toLowerCase();
      const isCollab = !!s.is_collaboration || /ft\.|feat|&|,| with /i.test(s.artist || '');
      if (filter === 'singles') return cat === 'single' && !s.hidden;
      if (filter === 'projects') return cat !== 'single' && !s.hidden;
      if (filter === 'collabs') return isCollab && !s.hidden;
      if (filter === 'hidden') return s.hidden;
      return true;
    });
  }, [songs, q, filter]);

  // Group by category for visual organization
  const groups = useMemo(() => {
    const map = new Map<string, Song[]>();
    filtered.forEach((s) => {
      const key = s.hidden ? 'Hidden' : ((s.category || 'single').toLowerCase() === 'single' ? 'Singles' : 'Projects & Albums');
      const arr = map.get(key) || []; arr.push(s); map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const selectAll = (rows: Song[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const all = rows.every((r) => next.has(r.id));
      rows.forEach((r) => all ? next.delete(r.id) : next.add(r.id));
      return next;
    });
  };

  const togglePreview = (s: Song) => {
    if (previewId === s.id) {
      audioRef.current?.pause();
      setPreviewId(null);
      return;
    }
    setPreviewId(s.id);
  };

  useEffect(() => {
    if (!previewId) return;
    const s = songs.find((x) => x.id === previewId);
    if (!s?.file_path) return;
    if (audioRef.current) {
      audioRef.current.src = s.file_path;
      audioRef.current.play().catch(() => toast.error('Preview unavailable'));
    }
  }, [previewId, songs]);

  const toggleHidden = async (s: Song, val: boolean) => {
    setSongs((prev) => prev.map((x) => (x.id === s.id ? { ...x, hidden: val } : x)));
    try { await adminUpdate('songs', s.id, { hidden: val }); }
    catch (e: any) { toast.error(e.message); setSongs((prev) => prev.map((x) => (x.id === s.id ? { ...x, hidden: !val } : x))); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this song?')) return;
    try { await adminDelete('songs', id); setSongs((p) => p.filter((s) => s.id !== id)); toast.success('Deleted'); }
    catch (e: any) { toast.error(e.message); }
  };

  const saveEdit = async (patch: Partial<Song>) => {
    if (!editTarget) return;
    try {
      const updated = await adminUpdate<Song>('songs', editTarget.id, patch);
      setSongs((prev) => prev.map((s) => (s.id === editTarget.id ? { ...s, ...updated } : s)));
      setEditTarget(null);
      toast.success('Saved');
    } catch (e: any) { toast.error(e.message); }
  };

  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      <audio ref={audioRef} onEnded={() => setPreviewId(null)} className="hidden" preload="none" />

      <BulkUploader onUploaded={refresh} />

      {/* Toolbar */}
      <div className="admin-glass rounded-2xl p-3 md:p-4 sticky top-12 z-10 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or artist…"
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9" />
          </div>
          <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-hidden">
            {(['all', 'singles', 'projects', 'collabs', 'hidden'] as const).map((k) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap ${filter === k ? 'admin-gradient-bg text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}>
                {k}
              </button>
            ))}
          </div>
          <div className="text-xs text-white/55 whitespace-nowrap">{filtered.length} / {songs.length}</div>
        </div>

        {selectedCount > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-white/70">{selectedCount} selected</span>
            <Button size="sm" variant="ghost" onClick={() => setBatchOpen(true)} className="h-8 text-purple-300 hover:text-purple-200">
              <Pencil className="h-3.5 w-3.5 mr-1" /> Batch edit
            </Button>
            <Button size="sm" variant="ghost" onClick={async () => {
              const ids = Array.from(selected);
              await Promise.all(ids.map((id) => adminUpdate('songs', id, { hidden: true })));
              setSongs((prev) => prev.map((s) => (selected.has(s.id) ? { ...s, hidden: true } : s)));
              toast.success(`Hid ${ids.length} tracks`);
            }} className="h-8 text-white/70 hover:text-white">
              <EyeOff className="h-3.5 w-3.5 mr-1" /> Hide
            </Button>
            <Button size="sm" variant="ghost" onClick={async () => {
              const ids = Array.from(selected);
              await Promise.all(ids.map((id) => adminUpdate('songs', id, { hidden: false })));
              setSongs((prev) => prev.map((s) => (selected.has(s.id) ? { ...s, hidden: false } : s)));
              toast.success(`Showed ${ids.length} tracks`);
            }} className="h-8 text-white/70 hover:text-white">
              <Eye className="h-3.5 w-3.5 mr-1" /> Show
            </Button>
            <Button size="sm" variant="ghost" onClick={async () => {
              if (!confirm(`Delete ${selectedCount} tracks?`)) return;
              const ids = Array.from(selected);
              await Promise.all(ids.map((id) => adminDelete('songs', id)));
              setSongs((prev) => prev.filter((s) => !selected.has(s.id)));
              setSelected(new Set());
              toast.success('Deleted');
            }} className="h-8 text-rose-300 hover:text-rose-200">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="h-8 text-white/50 ml-auto">
              Clear
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
      ) : (
        <div className="space-y-3">
          {groups.length === 0 && (
            <div className="admin-glass rounded-2xl p-8 text-center text-sm text-white/45">No tracks match.</div>
          )}
          {groups.map(([groupName, rows]) => {
            const isCollapsed = !!collapsed[groupName];
            const allInGroupSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
            return (
              <div key={groupName} className="admin-glass rounded-2xl overflow-hidden">
                <button onClick={() => setCollapsed((c) => ({ ...c, [groupName]: !c[groupName] }))}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/[0.03] transition text-left">
                  {isCollapsed ? <ChevronRight className="h-4 w-4 text-white/45" /> : <ChevronDown className="h-4 w-4 text-white/45" />}
                  <h3 className="font-display text-sm font-semibold text-white/85">{groupName}</h3>
                  <span className="text-xs text-white/45">{rows.length}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); selectAll(rows); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); selectAll(rows); } }}
                    className="ml-auto text-[11px] text-white/45 hover:text-white/80 cursor-pointer select-none">
                    {allInGroupSelected ? 'Unselect all' : 'Select all'}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul className="divide-y divide-white/5">
                    {rows.map((s) => {
                      const cover = coverUrl(s.thumbnail_path);
                      const isSelected = selected.has(s.id);
                      const isPlaying = previewId === s.id;
                      return (
                        <li key={s.id} className={`group flex items-center gap-3 px-3 md:px-4 py-2.5 transition ${isSelected ? 'bg-purple-500/10' : 'hover:bg-white/[0.03]'}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(s.id)}
                            className={`h-4 w-4 rounded border-white/20 bg-white/5 accent-purple-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`} />

                          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-white/[0.04] border border-white/5 shrink-0">
                            {cover ? <img src={cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                              : <Music2 className="h-4 w-4 text-white/30 absolute inset-0 m-auto" />}
                            {s.file_path && (
                              <button onClick={() => togglePreview(s)}
                                aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                                className={`absolute inset-0 flex items-center justify-center bg-black/60 transition ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
                              </button>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium truncate ${s.hidden ? 'text-white/45' : 'text-white'}`}>{s.title || 'Untitled'}</span>
                              {s.hidden && <span className="text-[10px] uppercase tracking-widest text-white/45 border border-white/15 rounded-full px-1.5">hidden</span>}
                              <span className="text-[10px] uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-1.5 capitalize">{s.category || 'single'}</span>
                            </div>
                            <div className="text-xs text-white/55 truncate">{s.artist || 'Unknown artist'}</div>
                          </div>

                          <div className="hidden md:flex items-center gap-4 text-xs text-white/55 tabular-nums shrink-0">
                            <span title="Plays">▶ {(s.play_count ?? 0).toLocaleString()}</span>
                            <span title="Likes">♥ {(s.likes_count ?? 0).toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition shrink-0">
                            <button onClick={() => toggleHidden(s, !s.hidden)} title={s.hidden ? 'Show on site' : 'Hide from site'}
                              className="h-8 w-8 flex items-center justify-center rounded-md text-white/65 hover:text-white hover:bg-white/5">
                              {s.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setEditTarget(s)} title="Edit"
                              className="h-8 w-8 flex items-center justify-center rounded-md text-white/65 hover:text-white hover:bg-white/5">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(s.id)} title="Delete"
                              className="h-8 w-8 flex items-center justify-center rounded-md text-rose-300/70 hover:text-rose-200 hover:bg-rose-500/10">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      {editTarget && <EditSongDialog song={editTarget} onClose={() => setEditTarget(null)} onSave={saveEdit} />}

      {/* Batch edit dialog */}
      {batchOpen && (
        <BatchEditDialog
          ids={Array.from(selected)}
          onClose={() => setBatchOpen(false)}
          onApplied={(patch) => {
            setSongs((prev) => prev.map((s) => (selected.has(s.id) ? { ...s, ...patch } : s)));
            setBatchOpen(false);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
};

// ─── Edit dialog ──────────────────────────────────────────────────────────────
const EditSongDialog: React.FC<{ song: Song; onClose: () => void; onSave: (p: Partial<Song>) => void }> = ({ song, onClose, onSave }) => {
  const [d, setD] = useState<Partial<Song>>({ ...song });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg">
        <DialogHeader><DialogTitle>Edit track</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Title"><Input value={d.title ?? ''} onChange={(e) => setD({ ...d, title: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          <Field label="Artist"><Input value={d.artist ?? ''} onChange={(e) => setD({ ...d, artist: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={d.category ?? 'single'} onChange={(e) => setD({ ...d, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm text-white">
                <option value="single">Single</option><option value="project">Project / EP</option><option value="album">Album</option>
              </select>
            </Field>
            <Field label="Release date">
              <Input type="date" value={(d.release_date ?? '').toString().slice(0, 10)}
                onChange={(e) => setD({ ...d, release_date: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </Field>
          </div>
          <Field label="Album / project ID (optional)">
            <Input value={d.album_id ?? ''} onChange={(e) => setD({ ...d, album_id: e.target.value || null as any })} className="bg-white/5 border-white/10 text-white" />
          </Field>
          <Field label="Support fund ($)">
            <Input type="number" value={((d.support_fund_cents ?? 0) / 100) as any}
              onChange={(e) => setD({ ...d, support_fund_cents: Math.round(Number(e.target.value) * 100) })}
              className="bg-white/5 border-white/10 text-white" />
          </Field>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Collaboration</span>
            <Switch checked={!!d.is_collaboration} onCheckedChange={(v) => setD({ ...d, is_collaboration: v })} />
          </div>
          {d.is_collaboration && (
            <Field label="Guest artists (comma separated)">
              <Input value={(d.guest_artists ?? []).join(', ')}
                onChange={(e) => setD({ ...d, guest_artists: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
                className="bg-white/5 border-white/10 text-white" />
            </Field>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Hidden from public library</span>
            <Switch checked={!!d.hidden} onCheckedChange={(v) => setD({ ...d, hidden: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70"><X className="h-4 w-4 mr-1" />Cancel</Button>
          <Button onClick={() => onSave({
            title: d.title, artist: d.artist, category: d.category, release_date: d.release_date || null,
            album_id: d.album_id || null, support_fund_cents: d.support_fund_cents ?? 0,
            is_collaboration: !!d.is_collaboration, guest_artists: d.guest_artists ?? [], hidden: !!d.hidden,
          })} className="admin-gradient-bg text-white border-0"><Save className="h-4 w-4 mr-1" />Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</div>{children}</div>
);

// ─── Batch edit dialog ────────────────────────────────────────────────────────
const BatchEditDialog: React.FC<{ ids: string[]; onClose: () => void; onApplied: (patch: Partial<Song>) => void }> = ({ ids, onClose, onApplied }) => {
  const [category, setCategory] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [hidden, setHidden] = useState<'unchanged' | 'true' | 'false'>('unchanged');
  const [saving, setSaving] = useState(false);

  const apply = async () => {
    const patch: any = {};
    if (category) patch.category = category;
    if (albumId) patch.album_id = albumId === '__clear__' ? null : albumId;
    if (releaseDate) patch.release_date = releaseDate;
    if (hidden !== 'unchanged') patch.hidden = hidden === 'true';
    if (!Object.keys(patch).length) { toast.info('Nothing to apply'); return; }
    setSaving(true);
    try {
      await Promise.all(ids.map((id) => adminUpdate('songs', id, patch)));
      toast.success(`Updated ${ids.length} tracks`);
      onApplied(patch);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg">
        <DialogHeader><DialogTitle>Batch edit · {ids.length} tracks</DialogTitle></DialogHeader>
        <p className="text-xs text-white/50 -mt-2">Only fields you fill in will be updated. Empty fields keep existing values.</p>
        <div className="space-y-3 mt-2">
          <Field label="Set category">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm text-white">
              <option value="">— unchanged —</option>
              <option value="single">Single</option><option value="project">Project / EP</option><option value="album">Album</option>
            </select>
          </Field>
          <Field label="Set album / project ID (or '__clear__' to empty)">
            <Input value={albumId} onChange={(e) => setAlbumId(e.target.value)} placeholder="— unchanged —" className="bg-white/5 border-white/10 text-white" />
          </Field>
          <Field label="Set release date">
            <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
          </Field>
          <Field label="Visibility">
            <select value={hidden} onChange={(e) => setHidden(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm text-white">
              <option value="unchanged">— unchanged —</option>
              <option value="false">Show on site</option>
              <option value="true">Hide from site</option>
            </select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">Cancel</Button>
          <Button onClick={apply} disabled={saving} className="admin-gradient-bg text-white border-0">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Bulk uploader (unchanged behavior, kept compact) ─────────────────────────
const BulkUploader: React.FC<{ onUploaded: () => void }> = ({ onUploaded }) => {
  const [items, setItems] = useState<{ file: File; title: string; artist: string; genre: string; status: 'pending' | 'uploading' | 'done' | 'error'; err?: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => /audio\/(mpeg|wav|x-wav|mp3)/i.test(f.type) || /\.(mp3|wav)$/i.test(f.name));
    if (!arr.length) { toast.error('Only MP3 and WAV files'); return; }
    setItems((prev) => [...prev, ...arr.map((file) => ({ file, title: file.name.replace(/\.[^.]+$/, ''), artist: 'Draii Rynell', genre: 'R&B/Soul', status: 'pending' as const }))]);
    setOpen(true);
  };

  const uploadAll = async () => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i]; if (it.status === 'done') continue;
      setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, status: 'uploading' } : x));
      try {
        const ext = it.file.name.split('.').pop() || 'mp3';
        const path = `${crypto.randomUUID()}.${ext}`;
        const publicUrl = await adminUploadFile('song-audio', path, it.file);
        await adminInsert('songs', {
          id: crypto.randomUUID(), title: it.title, artist: it.artist, genre: it.genre,
          file_path: publicUrl, status: 'published', visibility: 'published', category: 'single',
        });
        setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, status: 'done' } : x));
      } catch (e: any) {
        setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, status: 'error', err: e.message } : x));
      }
    }
    toast.success('Upload complete'); onUploaded();
  };

  return (
    <div className="admin-glass rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-purple-300" />
          <span className="font-display text-sm font-semibold">Upload tracks</span>
          {items.length > 0 && <span className="text-xs text-white/55">· {items.length} staged</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-white/45" /> : <ChevronRight className="h-4 w-4 text-white/45" />}
      </button>

      {open && (
        <div className="p-3 md:p-4 pt-0">
          <label
            onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            className={`block rounded-xl border-2 border-dashed text-center py-6 cursor-pointer transition-all ${drag ? 'border-purple-400 bg-purple-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}>
            <input ref={inputRef} type="file" multiple accept=".mp3,.wav,audio/*" className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)} />
            <Music2 className="h-6 w-6 mx-auto text-white/35" />
            <div className="mt-2 text-sm text-white/75">Drop audio files or click to choose</div>
            <div className="text-xs text-white/45 mt-0.5">MP3, WAV</div>
          </label>

          {items.length > 0 && (
            <>
              <div className="mt-3 space-y-2">
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
              <div className="mt-3 flex justify-end">
                <Button onClick={uploadAll} className="admin-gradient-bg text-white border-0 hover:opacity-90"><Upload className="h-4 w-4 mr-2" />Upload {items.length}</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
