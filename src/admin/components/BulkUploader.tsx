import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X, Music2, GripVertical, Trash2, Plus, Image as ImageIcon, Disc3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  insertRow, upsertReleaseTracks, setSongGenres, listTable,
  coverUrl, slugify, RELEASE_TYPES, ReleaseType, ReleaseVisibility, ReleaseStatus,
  Release, Genre,
} from '../lib/musicApi';
import { adminUploadFile } from '../lib/api';
import { invalidateMusicLibraryCache } from '@/hooks/useMusicLibrary';

interface Props {
  onClose: () => void;
  onDone: () => void;
}

interface TrackDraft {
  uid: string;
  file: File;
  title: string;
  artist: string;
  featured: string;
  explicit: boolean;
  bpm: string;
  isrc: string;
  lyrics: string;
  credits: string;
}

const newDraft = (file: File): TrackDraft => ({
  uid: crypto.randomUUID(),
  file,
  title: file.name.replace(/\.[^/.]+$/, '').replace(/^\d+[\s._-]*/, ''),
  artist: '',
  featured: '',
  explicit: false,
  bpm: '',
  isrc: '',
  lyrics: '',
  credits: '',
});

const detectDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.preload = 'metadata';
    a.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Math.round(a.duration || 0)); };
    a.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    a.src = url;
  });

const BulkUploader: React.FC<Props> = ({ onClose, onDone }) => {
  const [files, setFiles] = useState<TrackDraft[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared release metadata
  const [releaseTitle, setReleaseTitle] = useState('');
  const [primaryArtist, setPrimaryArtist] = useState('');
  const [releaseType, setReleaseType] = useState<ReleaseType>('single');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  const [copyright, setCopyright] = useState('');
  const [visibility, setVisibility] = useState<ReleaseVisibility>('public');
  const [status, setStatus] = useState<ReleaseStatus>('published');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ step: string; pct: number } | null>(null);
  const [dragUid, setDragUid] = useState<string | null>(null);

  useEffect(() => {
    listTable<Genre>('genres').then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    if (!coverFile) { setCoverPreview(''); return; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const mode: 'idle' | 'single' | 'release' = files.length === 0 ? 'idle' : files.length === 1 ? 'single' : 'release';

  // When files first added, infer defaults
  useEffect(() => {
    if (files.length === 1 && !releaseTitle) {
      setReleaseTitle(files[0].title);
      setReleaseType('single');
    } else if (files.length > 1) {
      if (releaseType === 'single') setReleaseType(files.length <= 6 ? 'ep' : 'album');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter((f) => f.type.startsWith('audio/') || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(f.name));
    if (!arr.length) { toast.error('No audio files found'); return; }
    setFiles((prev) => [...prev, ...arr.map(newDraft)]);
  };

  const removeFile = (uid: string) => setFiles((p) => p.filter((f) => f.uid !== uid));

  const patchTrack = (uid: string, patch: Partial<TrackDraft>) =>
    setFiles((p) => p.map((f) => (f.uid === uid ? { ...f, ...patch } : f)));

  const onDrop = (target_uid: string) => {
    if (!dragUid || dragUid === target_uid) return;
    setFiles((p) => {
      const from = p.findIndex((f) => f.uid === dragUid);
      const to = p.findIndex((f) => f.uid === target_uid);
      if (from < 0 || to < 0) return p;
      const next = [...p];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragUid(null);
  };

  const toggleGenre = (id: string) =>
    setSelectedGenres((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (!files.length) return;
    if (!releaseTitle.trim()) return toast.error('Title is required');
    if (!primaryArtist.trim()) return toast.error('Primary artist is required');
    // require at least one file having title
    if (files.some((f) => !f.title.trim())) return toast.error('Every track needs a title');

    setBusy(true);
    try {
      // 1. Upload cover (if any)
      let coverPath: string | null = null;
      if (coverFile) {
        setProgress({ step: 'Uploading cover…', pct: 5 });
        const ext = coverFile.name.split('.').pop() || 'jpg';
        const path = `covers/${Date.now()}-${crypto.randomUUID().slice(0, 6)}.${ext}`;
        coverPath = await adminUploadFile('song-art', path, coverFile);
      }

      // 2. Create release shell
      setProgress({ step: 'Creating release…', pct: 15 });
      const baseSlug = slugify(releaseTitle) || 'release';
      const release = await insertRow<Release>('releases', {
        title: releaseTitle.trim(),
        primary_artist: primaryArtist.trim(),
        type: releaseType,
        slug: `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`,
        cover_path: coverPath,
        description: description || null,
        release_date: releaseDate ? new Date(releaseDate).toISOString() : null,
        label: label || null,
        copyright: copyright || null,
        status,
        visibility,
      });

      // 3. Upload each audio + create song row, sequentially to keep progress sane
      const total = files.length;
      const trackRows: { release_id: string; song_id: string; track_number: number; disc_number: number }[] = [];
      for (let i = 0; i < total; i++) {
        const t = files[i];
        const baseFraction = 20 + Math.floor((i / total) * 70);
        setProgress({ step: `Uploading track ${i + 1} of ${total}: ${t.title}`, pct: baseFraction });

        const duration = await detectDuration(t.file);
        const ext = t.file.name.split('.').pop() || 'mp3';
        const audioPath = `tracks/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const publicUrl = await adminUploadFile('song-audio', audioPath, t.file);

        const artistFull = [t.artist || primaryArtist, t.featured && `feat. ${t.featured}`]
          .filter(Boolean).join(' ');

        const song = await insertRow<any>('songs', {
          title: t.title.trim(),
          artist: artistFull || primaryArtist,
          file_path: publicUrl,
          duration,
          bpm: t.bpm ? Number(t.bpm) : null,
          isrc: t.isrc || null,
          explicit: t.explicit,
          lyrics: t.lyrics || null,
          producer: t.credits || null,
          // thumbnail_path intentionally null -> frontend falls back to release cover
          release_date: releaseDate ? new Date(releaseDate).toISOString() : null,
          visibility: visibility === 'private' ? 'private' : 'public',
          status: status === 'published' ? 'published' : 'draft',
          is_collaboration: !!t.featured,
        });

        trackRows.push({
          release_id: release.id,
          song_id: song.id,
          track_number: i + 1,
          disc_number: 1,
        });

        // Apply genres to each song
        if (selectedGenres.length) {
          try { await setSongGenres(song.id, selectedGenres); } catch { /* non-fatal */ }
        }
      }

      // 4. Attach tracks to release
      setProgress({ step: 'Finalizing tracklist…', pct: 92 });
      await upsertReleaseTracks(trackRows.map((r) => ({ ...r, hidden: false })));

      invalidateMusicLibraryCache();
      setProgress({ step: 'Done', pct: 100 });
      toast.success(mode === 'single' ? 'Single published' : `Release "${release.title}" published with ${total} tracks`);
      onDone();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Upload failed');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const releaseTypeLabel = useMemo(
    () => RELEASE_TYPES.find((t) => t.value === releaseType)?.label || 'Release',
    [releaseType],
  );

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-4xl bg-black/90 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {mode === 'idle' ? 'Upload Music' : mode === 'single' ? 'New Single' : `New ${releaseTypeLabel}`}
          </DialogTitle>
          <p className="text-xs text-white/50">
            {mode === 'idle' && 'Drop one file to create a Single, or multiple files for an EP/Album.'}
            {mode === 'single' && 'One file detected — this will publish as a Single.'}
            {mode === 'release' && `${files.length} tracks detected — shared metadata applies to all tracks.`}
          </p>
        </DialogHeader>

        {/* Idle drop zone */}
        {mode === 'idle' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 rounded-xl py-16 text-center cursor-pointer hover:border-purple-400/50 hover:bg-white/[0.02] transition-colors"
          >
            <Upload className="h-10 w-10 mx-auto text-white/40 mb-3" />
            <div className="text-sm text-white/80">Drag audio files here, or click to browse</div>
            <div className="text-[11px] text-white/45 mt-1">MP3, WAV, FLAC, M4A, AAC, OGG</div>
            <input
              ref={fileInputRef} type="file" multiple accept="audio/*"
              className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>
        )}

        {mode !== 'idle' && (
          <div className="space-y-5">
            {/* Shared metadata */}
            <div className="grid lg:grid-cols-[220px_1fr] gap-5">
              <div className="space-y-2">
                <label className="block aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 relative group cursor-pointer">
                  {coverPreview
                    ? <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex flex-col items-center justify-center text-white/30 text-xs gap-2">
                        <ImageIcon className="h-8 w-8" />
                        <span>Add cover art</span>
                      </div>}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition">
                    {coverPreview ? 'Replace cover' : 'Upload cover'}
                  </div>
                  <input type="file" accept="image/*" hidden
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                </label>
                <p className="text-[10px] text-white/40 text-center">One cover used for the whole release</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <FieldGroup label={mode === 'single' ? 'Song Title' : 'Release Title'}>
                  <Input value={releaseTitle} onChange={(e) => setReleaseTitle(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Primary Artist">
                  <Input value={primaryArtist} onChange={(e) => setPrimaryArtist(e.target.value)} />
                </FieldGroup>
                {mode === 'release' && (
                  <FieldGroup label="Release Type">
                    <select value={releaseType} onChange={(e) => setReleaseType(e.target.value as ReleaseType)}
                      className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm">
                      {RELEASE_TYPES.filter((t) => t.value !== 'single').map((t) => (
                        <option key={t.value} value={t.value} className="bg-black">{t.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                )}
                <FieldGroup label="Release Date">
                  <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Visibility">
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value as ReleaseVisibility)}
                    className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm">
                    {['public', 'unlisted', 'private'].map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value as ReleaseStatus)}
                    className="w-full bg-white/5 border border-white/10 rounded-md h-9 px-2 text-sm">
                    {['draft', 'scheduled', 'published', 'archived'].map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                  </select>
                </FieldGroup>
                {mode === 'release' && (
                  <>
                    <FieldGroup label="Label"><Input value={label} onChange={(e) => setLabel(e.target.value)} /></FieldGroup>
                    <FieldGroup label="Copyright"><Input value={copyright} onChange={(e) => setCopyright(e.target.value)} /></FieldGroup>
                  </>
                )}
                <div className="col-span-2">
                  <FieldGroup label="Description">
                    <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                      className="bg-white/5 border-white/10" />
                  </FieldGroup>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] uppercase tracking-wider text-white/45 mb-1.5">Genres</div>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => {
                      const on = selectedGenres.includes(g.id);
                      return (
                        <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                          className={`px-2.5 py-1 rounded-full text-xs border ${on ? 'bg-purple-500/30 border-purple-400 text-white' : 'border-white/10 text-white/60 hover:text-white'}`}>
                          {g.name}
                        </button>
                      );
                    })}
                    {!genres.length && <span className="text-[11px] text-white/40">No genres yet — add them in Genres admin.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Track list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Tracks ({files.length})</h3>
                <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-purple-300 hover:text-purple-200">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add tracks
                </Button>
                <input ref={fileInputRef} type="file" multiple accept="audio/*" className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)} />
              </div>

              <ul className="space-y-2">
                {files.map((t, i) => (
                  <li key={t.uid}
                    draggable={files.length > 1}
                    onDragStart={() => setDragUid(t.uid)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(t.uid)}
                    className={`rounded-lg border border-white/10 bg-white/[0.02] p-3 ${dragUid === t.uid ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {files.length > 1 && <GripVertical className="h-4 w-4 text-white/30 cursor-grab" />}
                      <div className="h-7 w-7 rounded bg-white/5 flex items-center justify-center text-[11px] text-white/55">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/45 truncate">{t.file.name}</div>
                      </div>
                      <button onClick={() => removeFile(t.uid)} className="text-rose-300/70 hover:text-rose-200 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <MiniField label="Title">
                        <Input value={t.title} onChange={(e) => patchTrack(t.uid, { title: e.target.value })} className="h-8 text-xs" />
                      </MiniField>
                      <MiniField label="Featured Artists">
                        <Input value={t.featured} placeholder="optional" onChange={(e) => patchTrack(t.uid, { featured: e.target.value })} className="h-8 text-xs" />
                      </MiniField>
                      <MiniField label="BPM">
                        <Input value={t.bpm} type="number" onChange={(e) => patchTrack(t.uid, { bpm: e.target.value })} className="h-8 text-xs" />
                      </MiniField>
                      <MiniField label="ISRC">
                        <Input value={t.isrc} onChange={(e) => patchTrack(t.uid, { isrc: e.target.value })} className="h-8 text-xs" />
                      </MiniField>
                      <div className="flex items-center justify-between bg-white/5 rounded px-2 h-8 col-span-2 md:col-span-1 mt-4">
                        <span className="text-[11px] text-white/60">Explicit</span>
                        <Switch checked={t.explicit} onCheckedChange={(v) => patchTrack(t.uid, { explicit: v })} />
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <MiniField label="Credits / Producer">
                          <Input value={t.credits} placeholder="optional" onChange={(e) => patchTrack(t.uid, { credits: e.target.value })} className="h-8 text-xs" />
                        </MiniField>
                      </div>
                      <details className="col-span-2 md:col-span-4">
                        <summary className="text-[11px] text-white/45 cursor-pointer">Lyrics (optional)</summary>
                        <Textarea rows={4} value={t.lyrics} onChange={(e) => patchTrack(t.uid, { lyrics: e.target.value })}
                          className="bg-white/5 border-white/10 mt-2 text-xs" />
                      </details>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {progress && (
              <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div className="text-xs text-white/70 mb-2">{progress.step}</div>
                <div className="h-1.5 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress.pct}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <Button variant="ghost" disabled={busy} onClick={onClose}><X className="h-4 w-4 mr-1" /> Cancel</Button>
              <Button onClick={submit} disabled={busy} className="admin-gradient-bg">
                {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                {mode === 'single' ? 'Publish Single' : `Publish ${releaseTypeLabel} (${files.length} tracks)`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="space-y-1 block">
    <span className="text-[11px] uppercase tracking-wider text-white/45">{label}</span>
    <div className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white">{children}</div>
  </label>
);

const MiniField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="space-y-0.5 block">
    <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
    <div className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white">{children}</div>
  </label>
);

export default BulkUploader;
