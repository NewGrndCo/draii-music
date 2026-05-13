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

const DEFAULT_SECTIONS = ['next_up', 'events', 'merch', 'about'];

export const useArtistProfile = () => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await (supabase as any)
        .from('artist_profile')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      if (data) {
        const sections = Array.isArray(data.frontend_sections) && data.frontend_sections.length
          ? [...data.frontend_sections]
          : [...DEFAULT_SECTIONS];
        if (!sections.includes('about')) sections.push('about');
        setProfile({
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
        });
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { profile, loading };
};
