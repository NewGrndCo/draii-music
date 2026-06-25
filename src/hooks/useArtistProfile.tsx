import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ArtistProfile {
  id: string;
  bio: string;
  socials: Record<string, string>;
  player_layout: string;
  frontend_sections: string[];
  logo_url: string | null;
  location: string;
  footer_text: string;
  detailed_bio: string;
  artist_image_url: string | null;
  support_fund_enabled: boolean;
  stripe_payment_link: string | null;
  mailing_modal_enabled: boolean;
  mailing_required: boolean;
}

const DEFAULT_SECTIONS = ['trending', 'next_up', 'events', 'merch', 'about'];
const PROFILE_CACHE_KEY = 'artist-profile-cache-v2';
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

const normalize = (data: any): ArtistProfile => {
  const sections = Array.isArray(data.frontend_sections) && data.frontend_sections.length
    ? [...data.frontend_sections]
    : [...DEFAULT_SECTIONS];
  return {
    id: data.id,
    bio: data.bio ?? '',
    socials: data.socials ?? {},
    player_layout: data.player_layout ?? 'normal',
    frontend_sections: sections,
    logo_url: data.logo_url ?? null,
    location: data.location ?? '',
    footer_text: data.footer_text ?? '',
    detailed_bio: data.detailed_bio ?? '',
    artist_image_url: data.artist_image_url ?? null,
    support_fund_enabled: data.support_fund_enabled ?? true,
    stripe_payment_link: data.stripe_payment_link ?? null,
    mailing_modal_enabled: data.mailing_modal_enabled ?? true,
    mailing_required: data.mailing_required ?? false,
  };
};

export const useArtistProfile = () => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    // Serve cached profile if fresh — egress saver
    try {
      const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Date.now() - cached.t < PROFILE_CACHE_TTL_MS && cached.profile) {
          setProfile(cached.profile);
          setLoading(false);
          return () => { alive = false; };
        }
      }
    } catch { /* ignore */ }

    (async () => {
      const { data } = await (supabase as any)
        .from('artist_profile')
        .select('id,bio,socials,player_layout,frontend_sections,logo_url,location,footer_text,detailed_bio,artist_image_url,support_fund_enabled,stripe_payment_link,mailing_modal_enabled,mailing_required')
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      if (data) {
        const normalized = normalize(data);
        setProfile(normalized);
        try { sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ t: Date.now(), profile: normalized })); } catch {}
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { profile, loading };
};
