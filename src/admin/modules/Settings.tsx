import React, { useEffect, useState } from 'react';
import { adminList, adminUpdate } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Twitter, Youtube, Instagram, Music, Globe, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  bio: string;
  socials: Record<string, string>;
  player_layout: 'normal' | 'wide';
  frontend_sections: string[];
}

const SECTION_LABELS: Record<string, string> = {
  next_up: 'Next Up songs',
  events: 'Upcoming events',
  merch: 'Merch slider',
};
const ALL_SECTIONS = ['next_up', 'events', 'merch'];

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

  useEffect(() => {
    adminList<Profile>('artist_profile')
      .then((rows) => setProfile(rows[0] ?? null))
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
      });
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
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
          <h3 className="font-display text-base font-semibold mb-3">Artist bio</h3>
          <Textarea
            rows={6}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell your story…"
            className="bg-white/5 border-white/10 text-white"
          />
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
