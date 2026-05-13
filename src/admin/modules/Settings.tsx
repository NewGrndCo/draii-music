import React, { useEffect, useRef, useState } from 'react';
import { adminList, adminUpdate, adminUploadFile } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Twitter, Youtube, Instagram, Music, Globe, GripVertical, ArrowUp, ArrowDown, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  bio: string;
  socials: Record<string, string>;
  player_layout: 'normal' | 'wide';
  frontend_sections: string[];
  logo_url: string | null;
  location: string;
  footer_text: string;
  detailed_bio: string;
  artist_image_url: string | null;
}

const SECTION_LABELS: Record<string, string> = {
  next_up: 'Next Up songs',
  events: 'Upcoming events',
  merch: 'Merch slider',
  about: 'About the artist',
};
const ALL_SECTIONS = ['next_up', 'events', 'merch', 'about'];

const socialFields: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'twitter',   label: 'Twitter / X',   icon: Twitter },
  { key: 'instagram', label: 'Instagram',     icon: Instagram },
  { key: 'youtube',   label: 'YouTube',       icon: Youtube },
  { key: 'tiktok',    label: 'TikTok',        icon: Music },
  { key: 'spotify',   label: 'Spotify',       icon: Music },
  { key: 'apple',     label: 'Apple Music',   icon: Music },
];

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingArtist, setUploadingArtist] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const artistInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminList<Profile>('artist_profile')
      .then((rows) => {
        const r: any = rows[0];
        if (!r) { setProfile(null); return; }
        setProfile({
          id: r.id,
          bio: r.bio ?? '',
          socials: r.socials ?? {},
          player_layout: (r.player_layout ?? 'normal') as any,
          frontend_sections: Array.isArray(r.frontend_sections) && r.frontend_sections.length
            ? r.frontend_sections : ALL_SECTIONS,
          logo_url: r.logo_url ?? null,
          location: r.location ?? '',
          footer_text: r.footer_text ?? '',
          detailed_bio: r.detailed_bio ?? '',
          artist_image_url: r.artist_image_url ?? null,
        });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await adminUpdate('artist_profile', profile.id, {
        bio: profile.bio,
        socials: profile.socials,
        player_layout: profile.player_layout,
        frontend_sections: profile.frontend_sections?.length ? profile.frontend_sections : ALL_SECTIONS,
        logo_url: profile.logo_url,
        location: profile.location,
        footer_text: profile.footer_text,
        detailed_bio: profile.detailed_bio,
        artist_image_url: profile.artist_image_url,
      });
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onLogoFile = async (file: File) => {
    if (!profile) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `logo-${profile.id}-${Date.now()}.${ext}`;
      const url = await adminUploadFile('song-art', path, file);
      const next = { ...profile, logo_url: url };
      setProfile(next);
      await adminUpdate('artist_profile', profile.id, { logo_url: url });
      toast.success('Logo updated');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const onArtistImageFile = async (file: File) => {
    if (!profile) return;
    setUploadingArtist(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `artist-${profile.id}-${Date.now()}.${ext}`;
      const url = await adminUploadFile('song-art', path, file);
      const next = { ...profile, artist_image_url: url };
      setProfile(next);
      await adminUpdate('artist_profile', profile.id, { artist_image_url: url });
      toast.success('Artist image updated');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploadingArtist(false);
    }
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    if (!profile) return;
    const list = [...(profile.frontend_sections?.length ? profile.frontend_sections : ALL_SECTIONS)];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    setProfile({ ...profile, frontend_sections: list });
  };

  if (loading) return <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;
  if (!profile) return <div className="admin-glass rounded-2xl p-6 text-sm text-white/60">Profile row missing.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="admin-glass rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold mb-3">Logo (above the player)</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-28 w-28 rounded-xl bg-white border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              {profile.logo_url
                ? <img src={profile.logo_url} alt="Current logo" className="h-full w-full object-contain p-2" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                : <ImageIcon className="h-7 w-7 text-black/40" />}
            </div>
            <div className="flex-1 min-w-0">
              {profile.logo_url && (
                <div className="text-[11px] text-white/50 truncate mb-2">{profile.logo_url}</div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && onLogoFile(e.target.files[0])}
                />
                <Button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="admin-gradient-bg text-white border-0 hover:opacity-90"
                >
                  {uploadingLogo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {profile.logo_url ? 'Replace logo' : 'Upload logo'}
                </Button>
                {profile.logo_url && (
                  <Button variant="ghost" className="text-white/60 hover:text-white" onClick={async () => {
                    setProfile({ ...profile, logo_url: null });
                    await adminUpdate('artist_profile', profile.id, { logo_url: null });
                    toast.success('Logo removed');
                  }}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-glass rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold mb-1">Footer text</h3>
          <p className="text-xs text-white/50 mb-3">Shown at the bottom of the public player. The current year is appended automatically.</p>
          <Input
            value={profile.footer_text}
            onChange={(e) => setProfile({ ...profile, footer_text: e.target.value })}
            placeholder="App developed by New Ground Solutions"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="admin-glass rounded-2xl p-5 space-y-3">
          <div>
            <h3 className="font-display text-base font-semibold mb-3">Artist bio</h3>
            <Textarea
              rows={6}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell your story…"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-white/55 mb-1.5 block">Location</Label>
            <Input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="City, Region"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="admin-glass rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-display text-base font-semibold">About the artist (detailed)</h3>
            <p className="text-xs text-white/50 mt-1">Shown on the public player below Events &amp; Merch. The short bio above stays as the header tagline.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-32 w-32 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.artist_image_url
                ? <img src={profile.artist_image_url} alt="Artist" className="h-full w-full object-cover" />
                : <ImageIcon className="h-7 w-7 text-white/40" />}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <input
                ref={artistInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && onArtistImageFile(e.target.files[0])}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => artistInputRef.current?.click()}
                  disabled={uploadingArtist}
                  className="admin-gradient-bg text-white border-0 hover:opacity-90"
                >
                  {uploadingArtist ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {profile.artist_image_url ? 'Replace artist image' : 'Upload artist image'}
                </Button>
                {profile.artist_image_url && (
                  <Button variant="ghost" className="text-white/60 hover:text-white" onClick={async () => {
                    setProfile({ ...profile, artist_image_url: null });
                    await adminUpdate('artist_profile', profile.id, { artist_image_url: null });
                    toast.success('Image removed');
                  }}>Remove</Button>
                )}
              </div>
              {profile.artist_image_url && (
                <div className="text-[11px] text-white/50 truncate">{profile.artist_image_url}</div>
              )}
            </div>
          </div>
          <div>
            <Label className="text-xs text-white/55 mb-1.5 block">Detailed bio</Label>
            <Textarea
              rows={8}
              value={profile.detailed_bio}
              onChange={(e) => setProfile({ ...profile, detailed_bio: e.target.value })}
              placeholder="A longer story about the artist — career, sound, influences…"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="admin-glass rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold mb-3">Social links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {socialFields.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <Label className="text-xs text-white/55 flex items-center gap-1.5 mb-1.5"><Icon className="h-3 w-3" /> {label}</Label>
                <Input
                  value={profile.socials[key] || ''}
                  onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, [key]: e.target.value } })}
                  placeholder="https://…"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="admin-gradient-bg text-white border-0 hover:opacity-90">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save changes
        </Button>
      </div>

      <div className="space-y-5">
        <div className="admin-glass-strong rounded-2xl p-5 space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/45">Frontend</div>
            <h3 className="font-display text-base font-semibold mt-0.5 flex items-center gap-2"><Globe className="h-4 w-4 text-purple-300" /> Player layout</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['normal', 'wide'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setProfile({ ...profile, player_layout: opt })}
                className={`rounded-xl border p-4 text-left transition-all
                  ${profile.player_layout === opt
                    ? 'admin-gradient-soft-bg border-white/20 shadow-[0_0_24px_-8px_hsl(var(--admin-purple)/0.6)]'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'}`}
              >
                <div className="text-sm font-medium capitalize">{opt}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  {opt === 'normal' ? 'Standard player layout' : 'Wide for Smart TV / tablet'}
                </div>
                <div className={`mt-3 rounded-md ${opt === 'wide' ? 'aspect-[16/6]' : 'aspect-[3/4]'} bg-white/[0.05] border border-white/10`} />
              </button>
            ))}
          </div>
        </div>

        <div className="admin-glass-strong rounded-2xl p-5 space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/45">Frontend</div>
            <h3 className="font-display text-base font-semibold mt-0.5">Section order</h3>
            <p className="text-xs text-white/50 mt-1">Reorder how Next Up, Events and Merch appear on the public player.</p>
          </div>
          <div className="space-y-2">
            {(profile.frontend_sections?.length ? profile.frontend_sections : ALL_SECTIONS).map((key, idx, arr) => (
              <div key={key} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <GripVertical className="h-4 w-4 text-white/40" />
                <div className="flex-1 text-sm">{SECTION_LABELS[key] ?? key}</div>
                <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => moveSection(idx, -1)} className="h-7 w-7 text-white/70"><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" disabled={idx === arr.length - 1} onClick={() => moveSection(idx, 1)} className="h-7 w-7 text-white/70"><ArrowDown className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
