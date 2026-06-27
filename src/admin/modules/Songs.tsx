import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Pencil, Trash2, Music2, EyeOff, Eye, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { listTable, updateRow, deleteRow, coverUrl } from '../lib/musicApi';
import BulkUploader from '../components/BulkUploader';
import { invalidateMusicLibraryCache } from '@/hooks/useMusicLibrary';
import { useArtistProfile } from '@/hooks/useArtistProfile';

interface SongRow {
  id: string;
  title: string | null;
  artist: string | null;
  slug: string | null;
  duration: number | null;
  bpm: number | null;
  isrc: string | null;
  explicit: boolean;
  composer: string | null;
  producer: string | null;
  lyrics: string | null;
  genre: string | null;
  file_path: string | null;
  thumbnail_path: string | null;
  play_count: number | null;
  likes_count: number | null;
  hidden: boolean;
  dsp_link: string | null;
}

const Songs: React.FC = () => {
  const { profile } = useArtistProfile();
  const defaultCover = profile?.default_cover_url || null;
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<SongRow | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const refresh = () => {
    setLoading(true);
    listTable<SongRow>('songs')
      .then((rows) => setSongs(rows.filter((r) => !!r.file_path))) // hide legacy shells
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return songs;
    return songs.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(needle) ||
        (s.artist || '').toLowerCase().includes(needle),
    );
  }, [songs, q]);

  const remove = async (id: string) => {
    if (!confirm('Delete this song? It will be removed from all releases.')) return;
    try { await deleteRow('songs', id); setSongs((p) => p.filter((s) => s.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleHidden = async (s: SongRow) => {
    const v = !s.hidden;
    setSongs((p) => p.map((x) => (x.id === s.id ? { ...x, hidden: v } : x)));
    try { await updateRow('songs', s.id, { hidden: v }); }
    catch (e: any) { toast.error(e.message); refresh(); }
  };

  return (
    <div className="space-y-4">
      <div className="admin-glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Songs</h2>
          <p className="text-xs text-white/50">Master catalog of audio recordings. Releases are managed separately.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="ml-auto admin-gradient-bg">
          <Upload className="h-4 w-4 mr-2" /> Upload Song
        </Button>
      </div>

      <div className="admin-glass rounded-2xl p-3 sticky top-12 z-10 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or artist…"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/45">
            {filtered.length} / {songs.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-glass rounded-2xl p-12 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white/50" />
        </div>
      ) : (
        <div className="admin-glass rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/45">No songs.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filtered.map((s) => {
                const cover = coverUrl(s.thumbnail_path) || defaultCover;
                return (
                  <li key={s.id} className="group flex items-center gap-3 px-3 md:px-4 py-2.5 hover:bg-white/[0.03]">
                    <div className="h-11 w-11 rounded-lg overflow-hidden bg-white/[0.04] border border-white/5 shrink-0 relative">
                      {cover
                        ? <img src={cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        : <Music2 className="h-4 w-4 text-white/30 absolute inset-0 m-auto" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">{s.title || 'Untitled'}</div>
                      <div className="text-[11px] text-white/50 truncate">{s.artist || '—'}</div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[11px] text-white/45">
                      <span>{s.play_count ?? 0} plays</span>
                      <span>{s.likes_count ?? 0} likes</span>
                      {s.bpm && <span>{s.bpm} BPM</span>}
                    </div>
                    <button
                      onClick={() => toggleHidden(s)}
                      title={s.hidden ? 'Show' : 'Hide'}
                      className="p-1.5 text-white/55 hover:text-white"
                    >
                      {s.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEdit(s)} className="p-1.5 text-white/55 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(s.id)} className="p-1.5 text-rose-300/70 hover:text-rose-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {edit && <SongEditor song={edit} onClose={() => setEdit(null)} onSaved={(u) => { setSongs((p) => p.map((s) => s.id === u.id ? { ...s, ...u } : s)); setEdit(null); invalidateMusicLibraryCache(); }} />}
      {uploadOpen && <BulkUploader onClose={() => setUploadOpen(false)} onDone={() => { setUploadOpen(false); invalidateMusicLibraryCache(); refresh(); }} />}
    </div>
  );
};

const SongEditor: React.FC<{ song: SongRow; onClose: () => void; onSaved: (u: SongRow) => void }> = ({ song, onClose, onSaved }) => {
  const [draft, setDraft] = useState<SongRow>(song);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const patch = {
        title: draft.title, artist: draft.artist, slug: draft.slug,
        bpm: draft.bpm, isrc: draft.isrc, explicit: draft.explicit,
        composer: draft.composer, producer: draft.producer, lyrics: draft.lyrics,
        genre: draft.genre, dsp_link: draft.dsp_link,
      };
      const u = await updateRow<SongRow>('songs', song.id, patch);
      onSaved(u);
      toast.success('Saved');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const field = (k: keyof SongRow, v: any) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-black/85 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
          <p className="text-xs text-white/50">Recording metadata only. Cover art, track number, and release date live on the release.</p>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Lbl label="Title"><Input value={draft.title || ''} onChange={(e) => field('title', e.target.value)} /></Lbl>
          <Lbl label="Primary Artist"><Input value={draft.artist || ''} onChange={(e) => field('artist', e.target.value)} /></Lbl>
          <Lbl label="Slug"><Input value={draft.slug || ''} onChange={(e) => field('slug', e.target.value)} /></Lbl>
          <Lbl label="Genre"><Input value={draft.genre || ''} onChange={(e) => field('genre', e.target.value)} /></Lbl>
          <Lbl label="BPM"><Input type="number" value={draft.bpm ?? ''} onChange={(e) => field('bpm', e.target.value ? Number(e.target.value) : null)} /></Lbl>
          <Lbl label="ISRC"><Input value={draft.isrc || ''} onChange={(e) => field('isrc', e.target.value)} /></Lbl>
          <Lbl label="Composer"><Input value={draft.composer || ''} onChange={(e) => field('composer', e.target.value)} /></Lbl>
          <Lbl label="Producer"><Input value={draft.producer || ''} onChange={(e) => field('producer', e.target.value)} /></Lbl>
          <Lbl label="DSP Link"><Input value={draft.dsp_link || ''} onChange={(e) => field('dsp_link', e.target.value)} /></Lbl>
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 h-9 mt-5">
            <span className="text-xs text-white/70">Explicit</span>
            <Switch checked={!!draft.explicit} onCheckedChange={(v) => field('explicit', v)} />
          </div>
          <div className="col-span-2">
            <Lbl label="Lyrics">
              <Textarea value={draft.lyrics || ''} onChange={(e) => field('lyrics', e.target.value)} rows={6} className="bg-white/5 border-white/10" />
            </Lbl>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="admin-gradient-bg">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Lbl: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="space-y-1 block">
    <span className="text-[11px] uppercase tracking-wider text-white/45">{label}</span>
    <div className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white">{children}</div>
  </label>
);

export default Songs;
