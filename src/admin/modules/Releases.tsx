import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, ChevronDown, ChevronRight, GripVertical, X, Disc3, Music2, Search, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  listTable, insertRow, updateRow, deleteRow,
  listReleaseTracks, upsertReleaseTracks, removeReleaseTrack, reorderReleaseTracks,
  Release, ReleaseTrack, ReleaseType, ReleaseStatus, ReleaseVisibility,
  coverUrl, RELEASE_TYPES, slugify,
} from '../lib/musicApi';
import { adminCall, adminUploadFile } from '../lib/api';
import { invalidateMusicLibraryCache } from '@/hooks/useMusicLibrary';
import { supabase } from '@/integrations/supabase/client';

const Releases: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReleaseType | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [defaultCover, setDefaultCover] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savingDefault, setSavingDefault] = useState(false);

  const refresh = () => {
    setLoading(true);
    listTable<Release>('releases')
      .then(setReleases)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  // Load artist_profile.default_cover_url so we can show & manage it here.
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from('artist_profile')
        .select('id,default_cover_url')
        .limit(1)
        .maybeSingle();
      if (data) {
        setProfileId(data.id);
        setDefaultCover(data.default_cover_url ?? null);
      }
    })();
  }, []);

  const uploadDefault = async (file: File) => {
    if (!profileId) { toast.error('Profile not loaded'); return; }
    setSavingDefault(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `defaults/cover-${Date.now()}.${ext}`;
      const url = await adminUploadFile('song-art', path, file);
      await adminCall({ op: 'update', table: 'artist_profile', id: profileId, payload: { default_cover_url: url } } as any);
      setDefaultCover(url);
      invalidateMusicLibraryCache();
      toast.success('Default cover updated');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingDefault(false); }
  };

  const clearDefault = async () => {
    if (!profileId) return;
    setSavingDefault(true);
    try {
      await adminCall({ op: 'update', table: 'artist_profile', id: profileId, payload: { default_cover_url: null } } as any);
      setDefaultCover(null);
      invalidateMusicLibraryCache();
      toast.success('Default cover removed');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingDefault(false); }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return releases.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (needle && !(r.title.toLowerCase().includes(needle) || r.primary_artist.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [releases, q, typeFilter]);

  const removeRelease = async (id: string) => {
    if (!confirm('Delete this release? Songs themselves will NOT be deleted.')) return;
    try { await deleteRow('releases', id); setReleases((p) => p.filter((r) => r.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="admin-glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Releases</h2>
          <p className="text-xs text-white/50">Singles, EPs, albums, compilations, mixtapes, collaborations.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="ml-auto admin-gradient-bg">
          <Plus className="h-4 w-4 mr-2" /> Create Release
        </Button>
      </div>

      <div className="admin-glass rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="h-16 w-16 rounded-lg overflow-hidden bg-white/[0.04] border border-white/10 shrink-0 flex items-center justify-center">
          {defaultCover
            ? <img src={defaultCover} alt="Default cover" className="h-full w-full object-cover" />
            : <ImageIcon className="h-6 w-6 text-white/30" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white">Default Cover</div>
          <p className="text-xs text-white/50">Used automatically when a release or song has no cover uploaded.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className={`px-3 py-1.5 rounded-md text-xs cursor-pointer bg-white/5 hover:bg-white/10 text-white ${savingDefault ? 'opacity-60 pointer-events-none' : ''}`}>
            {savingDefault ? 'Uploading…' : (defaultCover ? 'Replace' : 'Upload')}
            <input type="file" accept="image/*" hidden disabled={savingDefault}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDefault(f); e.currentTarget.value = ''; }} />
          </label>
          {defaultCover && (
            <Button variant="ghost" size="sm" disabled={savingDefault} onClick={clearDefault}
              className="text-rose-300/80 hover:text-rose-200 h-8 px-2">
              <X className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          )}
        </div>
      </div>

      <div className="admin-glass rounded-2xl p-3 sticky top-12 z-10 backdrop-blur flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search releases…"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9" />
        </div>
        <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-hidden">
          {(['all', ...RELEASE_TYPES.map((t) => t.value)] as const).map((k) => (
            <button key={k} onClick={() => setTypeFilter(k as any)}
              className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap ${typeFilter === k ? 'admin-gradient-bg text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
      ) : (
        <div className="grid gap-3">
          {filtered.length === 0 && (
            <div className="admin-glass rounded-2xl p-8 text-center text-sm text-white/45">No releases match.</div>
          )}
          {filtered.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="admin-glass rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : r.id)} className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] text-left">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-white/45" /> : <ChevronRight className="h-4 w-4 text-white/45" />}
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/[0.04] border border-white/5 shrink-0 flex items-center justify-center">
                    {r.cover_path
                      ? <img src={coverUrl(r.cover_path)} alt="" loading="lazy" className="h-full w-full object-cover" />
                      : defaultCover
                        ? <img src={defaultCover} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
                        : <Disc3 className="h-5 w-5 text-white/30" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">{r.title}</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/45 border border-white/10 rounded-full px-1.5">{r.type}</span>
                      {r.status !== 'published' && <span className="text-[10px] uppercase text-amber-300/80">{r.status}</span>}
                      {r.visibility !== 'public' && <span className="text-[10px] uppercase text-cyan-300/80">{r.visibility}</span>}
                    </div>
                    <div className="text-[11px] text-white/50 truncate">{r.primary_artist}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeRelease(r.id); }} className="p-1.5 text-rose-300/70 hover:text-rose-200 ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </button>
                {isOpen && (
                  <ReleaseEditor
                    release={r}
                    onSaved={(u) => setReleases((p) => p.map((x) => x.id === u.id ? { ...x, ...u } : x))}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && <CreateReleaseDialog onClose={() => setCreating(false)} onCreated={(r) => { setReleases((p) => [r, ...p]); setCreating(false); setExpanded(r.id); }} />}
    </div>
  );
};

const CreateReleaseDialog: React.FC<{ onClose: () => void; onCreated: (r: Release) => void }> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [type, setType] = useState<ReleaseType>('single');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title || !artist) { toast.error('Title and artist required'); return; }
    setBusy(true);
    try {
      const r = await insertRow<Release>('releases', {
        title, primary_artist: artist, type,
        slug: slugify(title) + '-' + crypto.randomUUID().slice(0, 4),
      });
      onCreated(r);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-black/85 border-white/10 text-white">
        <DialogHeader><DialogTitle>Create Release</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/45">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/45">Primary Artist</label>
            <Input value={artist} onChange={(e) => setArtist(e.target.value)} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/45">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as ReleaseType)}
              className="w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm text-white">
              {RELEASE_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-black">{t.label}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="admin-gradient-bg">{busy ? 'Creating…' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ReleaseEditor: React.FC<{ release: Release; onSaved: (u: Release) => void }> = ({ release, onSaved }) => {
  const [draft, setDraft] = useState<Release>(release);
  useEffect(() => setDraft(release), [release.id]);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const field = <K extends keyof Release>(k: K, v: Release[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const patch = {
        title: draft.title, primary_artist: draft.primary_artist, type: draft.type,
        cover_path: draft.cover_path, description: draft.description,
        release_date: draft.release_date, label: draft.label, upc: draft.upc, copyright: draft.copyright,
        status: draft.status, visibility: draft.visibility, slug: draft.slug,
      };
      const u = await updateRow<Release>('releases', release.id, patch);
      onSaved(u);
      invalidateMusicLibraryCache();
      toast.success('Saved');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `covers/${release.id}-${Date.now()}.${ext}`;
      const url = await adminUploadFile('song-art', path, file);
      // Persist immediately so the upload survives without an extra Save click.
      const u = await updateRow<Release>('releases', release.id, { cover_path: url });
      field('cover_path', url);
      onSaved(u);
      invalidateMusicLibraryCache();
      toast.success('Cover updated');
    } catch (e: any) { toast.error(e.message); }
    finally { setUploadingCover(false); }
  };

  return (
    <div className="border-t border-white/5 p-4 grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Metadata column */}
      <div className="space-y-3">
        <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/5 relative">
          {draft.cover_path
            ? <img src={coverUrl(draft.cover_path)} alt="" className="h-full w-full object-cover" />
            : <Disc3 className="h-12 w-12 text-white/20 m-auto mt-20" />}
          <label className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-[11px] px-2 py-1 rounded cursor-pointer hover:bg-black">
            {uploadingCover ? 'Uploading…' : 'Change cover'}
            <input type="file" accept="image/*" hidden disabled={uploadingCover}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
          </label>
        </div>
        <Field label="Title"><Input value={draft.title} onChange={(e) => field('title', e.target.value)} /></Field>
        <Field label="Primary Artist"><Input value={draft.primary_artist} onChange={(e) => field('primary_artist', e.target.value)} /></Field>
        <Field label="Type">
          <select value={draft.type} onChange={(e) => field('type', e.target.value as ReleaseType)}
            className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm text-white">
            {RELEASE_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-black">{t.label}</option>)}
          </select>
        </Field>
        <Field label="Slug"><Input value={draft.slug} onChange={(e) => field('slug', e.target.value)} /></Field>
        <Field label="Release Date">
          <Input type="date" value={draft.release_date ? draft.release_date.slice(0, 10) : ''}
            onChange={(e) => field('release_date', e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </Field>
        <Field label="Label"><Input value={draft.label || ''} onChange={(e) => field('label', e.target.value)} /></Field>
        <Field label="UPC"><Input value={draft.upc || ''} onChange={(e) => field('upc', e.target.value)} /></Field>
        <Field label="Copyright"><Input value={draft.copyright || ''} onChange={(e) => field('copyright', e.target.value)} /></Field>
        <Field label="Status">
          <select value={draft.status} onChange={(e) => field('status', e.target.value as ReleaseStatus)}
            className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm text-white">
            {['draft', 'scheduled', 'published', 'archived'].map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
          </select>
        </Field>
        <Field label="Visibility">
          <select value={draft.visibility} onChange={(e) => field('visibility', e.target.value as ReleaseVisibility)}
            className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm text-white">
            {['public', 'unlisted', 'private'].map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
          </select>
        </Field>
        <Field label="Description">
          <Textarea value={draft.description || ''} onChange={(e) => field('description', e.target.value)} rows={3}
            className="bg-white/5 border-white/10 text-white" />
        </Field>
        <Button onClick={save} disabled={saving} className="admin-gradient-bg w-full">{saving ? 'Saving…' : 'Save'}</Button>
      </div>

      {/* Track list */}
      <TrackList releaseId={release.id} primaryArtist={draft.primary_artist} />
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="space-y-1 block">
    <span className="text-[11px] uppercase tracking-wider text-white/45">{label}</span>
    <div className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white">{children}</div>
  </label>
);

const TrackList: React.FC<{ releaseId: string; primaryArtist: string }> = ({ releaseId, primaryArtist }) => {
  const [tracks, setTracks] = useState<ReleaseTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState(false);

  const refresh = () => {
    setLoading(true);
    listReleaseTracks(releaseId).then(setTracks).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(refresh, [releaseId]);

  const remove = async (song_id: string) => {
    try { await removeReleaseTrack(releaseId, song_id); setTracks((p) => p.filter((t) => t.song_id !== song_id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const moveByDelta = async (song_id: string, delta: number) => {
    const sorted = [...tracks].sort((a, b) => a.track_number - b.track_number);
    const idx = sorted.findIndex((t) => t.song_id === song_id);
    const swap = idx + delta;
    if (idx < 0 || swap < 0 || swap >= sorted.length) return;
    [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
    const renumbered = sorted.map((t, i) => ({ ...t, track_number: i + 1 }));
    setTracks(renumbered);
    try {
      await reorderReleaseTracks(renumbered.map((t) => ({ release_id: releaseId, song_id: t.song_id, track_number: t.track_number, disc_number: t.disc_number })));
    } catch (e: any) { toast.error(e.message); refresh(); }
  };

  const toggleHidden = async (t: ReleaseTrack) => {
    const v = !t.hidden;
    setTracks((p) => p.map((x) => x.song_id === t.song_id ? { ...x, hidden: v } : x));
    try { await upsertReleaseTracks([{ release_id: releaseId, song_id: t.song_id, track_number: t.track_number, disc_number: t.disc_number, hidden: v }]); }
    catch (e: any) { toast.error(e.message); refresh(); }
  };

  // HTML5 native drag-drop
  const [dragSong, setDragSong] = useState<string | null>(null);
  const onDrop = async (target_song_id: string) => {
    if (!dragSong || dragSong === target_song_id) return;
    const sorted = [...tracks].sort((a, b) => a.track_number - b.track_number);
    const from = sorted.findIndex((t) => t.song_id === dragSong);
    const to = sorted.findIndex((t) => t.song_id === target_song_id);
    if (from < 0 || to < 0) return;
    const [moved] = sorted.splice(from, 1);
    sorted.splice(to, 0, moved);
    const renumbered = sorted.map((t, i) => ({ ...t, track_number: i + 1 }));
    setTracks(renumbered);
    setDragSong(null);
    try {
      await reorderReleaseTracks(renumbered.map((t) => ({ release_id: releaseId, song_id: t.song_id, track_number: t.track_number, disc_number: t.disc_number })));
    } catch (e: any) { toast.error(e.message); refresh(); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Tracks <span className="text-white/40">({tracks.length})</span></h3>
        <Button size="sm" variant="ghost" onClick={() => setPicker(true)} className="text-purple-300 hover:text-purple-200">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Song
        </Button>
      </div>
      {loading ? (
        <div className="text-xs text-white/45 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading tracks…</div>
      ) : tracks.length === 0 ? (
        <div className="text-sm text-white/45 italic py-6 text-center border border-dashed border-white/10 rounded-lg">No tracks yet. Add songs from your catalog.</div>
      ) : (
        <ul className="divide-y divide-white/5 border border-white/5 rounded-lg overflow-hidden bg-white/[0.02]">
          {[...tracks].sort((a, b) => a.track_number - b.track_number).map((t, i) => (
            <li key={t.song_id}
              draggable
              onDragStart={() => setDragSong(t.song_id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(t.song_id)}
              className={`flex items-center gap-2 px-2 py-2 text-sm ${dragSong === t.song_id ? 'opacity-40' : ''} hover:bg-white/[0.04]`}>
              <GripVertical className="h-4 w-4 text-white/30 cursor-grab" />
              <span className="w-6 text-right text-xs text-white/45">{i + 1}</span>
              {t.songs?.thumbnail_path
                ? <img src={coverUrl(t.songs.thumbnail_path)} alt="" className="h-8 w-8 rounded object-cover" />
                : <div className="h-8 w-8 rounded bg-white/[0.04] flex items-center justify-center"><Music2 className="h-3 w-3 text-white/30" /></div>}
              <div className="min-w-0 flex-1">
                <div className="text-white truncate">{t.songs?.title || 'Untitled'}</div>
                <div className="text-[10px] text-white/45 truncate">{t.songs?.artist}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => moveByDelta(t.song_id, -1)} className="text-white/40 hover:text-white text-xs px-1">↑</button>
                <button onClick={() => moveByDelta(t.song_id, 1)} className="text-white/40 hover:text-white text-xs px-1">↓</button>
                <label className="flex items-center gap-1 text-[10px] text-white/50">
                  <Switch checked={t.hidden} onCheckedChange={() => toggleHidden(t)} />
                  Hidden
                </label>
                <button onClick={() => remove(t.song_id)} className="text-rose-300/70 hover:text-rose-200 p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {picker && (
        <SongPicker
          existingIds={new Set(tracks.map((t) => t.song_id))}
          primaryArtist={primaryArtist}
          onClose={() => setPicker(false)}
          onPick={async (song_id) => {
            try {
              const nextNum = (tracks.length === 0 ? 0 : Math.max(...tracks.map((t) => t.track_number))) + 1;
              await upsertReleaseTracks([{ release_id: releaseId, song_id, track_number: nextNum, disc_number: 1, hidden: false }]);
              refresh();
            } catch (e: any) { toast.error(e.message); }
          }}
        />
      )}
    </div>
  );
};

const SongPicker: React.FC<{ existingIds: Set<string>; primaryArtist: string; onClose: () => void; onPick: (id: string) => void }> = ({ existingIds, onClose, onPick }) => {
  const [songs, setSongs] = useState<{ id: string; title: string | null; artist: string | null; thumbnail_path: string | null; file_path: string | null }[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    listTable<any>('songs').then((rows) => setSongs(rows.filter((r) => r.file_path))).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return songs.filter((s) => !existingIds.has(s.id) && (
      !needle || (s.title || '').toLowerCase().includes(needle) || (s.artist || '').toLowerCase().includes(needle)
    ));
  }, [songs, q, existingIds]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-black/85 border-white/10 text-white">
        <DialogHeader><DialogTitle>Add Song to Release</DialogTitle></DialogHeader>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search songs…"
          className="bg-white/5 border-white/10 text-white" />
        <div className="max-h-[55vh] overflow-y-auto divide-y divide-white/5 border border-white/5 rounded-lg">
          {filtered.length === 0 && <div className="p-6 text-center text-sm text-white/40">No songs available.</div>}
          {filtered.map((s) => (
            <button key={s.id} onClick={() => { onPick(s.id); onClose(); }}
              className="w-full flex items-center gap-3 p-2 hover:bg-white/[0.05] text-left">
              {s.thumbnail_path
                ? <img src={coverUrl(s.thumbnail_path)} alt="" className="h-9 w-9 rounded object-cover" />
                : <div className="h-9 w-9 rounded bg-white/[0.04]" />}
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">{s.title}</div>
                <div className="text-[11px] text-white/50 truncate">{s.artist}</div>
              </div>
              <Plus className="h-4 w-4 text-purple-300" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Releases;
