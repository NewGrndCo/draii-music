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
}

const DEFAULT_SECTIONS = ['next_up', 'events', 'merch'];

export const useArtistProfile = () => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await (supabase as any)
        .from('artist_profile')
        .select('id,bio,socials,player_layout,frontend_sections,logo_url,location')
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      if (data) {
        setProfile({
          id: data.id,
          bio: data.bio ?? '',
          socials: data.socials ?? {},
          player_layout: data.player_layout ?? 'normal',
          frontend_sections: Array.isArray(data.frontend_sections) && data.frontend_sections.length
            ? data.frontend_sections
            : DEFAULT_SECTIONS,
          logo_url: data.logo_url ?? null,
          location: data.location ?? '',
        });
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { profile, loading };
};
