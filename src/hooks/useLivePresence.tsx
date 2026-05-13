import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveListener {
  id: string;
  joined_at: number;
  song_id?: string;
  song_title?: string;
  song_artist?: string;
  cover_art?: string;
  country?: string;
  city?: string;
  region?: string;
  device?: string;
}

const CHANNEL_NAME = 'listeners-live';
const GEO_CACHE_KEY = 'live-presence-geo-v1';

const detectDevice = () => {
  if (typeof navigator === 'undefined') return 'unknown';
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
};

type Geo = { country?: string; city?: string; region?: string };

let geoPromise: Promise<Geo> | null = null;
const getGeo = (): Promise<Geo> => {
  if (geoPromise) return geoPromise;
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      geoPromise = Promise.resolve(JSON.parse(cached));
      return geoPromise;
    }
  } catch {}
  geoPromise = fetch('https://ipapi.co/json/')
    .then((r) => (r.ok ? r.json() : {}))
    .then((d: any) => {
      const g: Geo = {
        country: d?.country_name || d?.country,
        city: d?.city,
        region: d?.region,
      };
      try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(g)); } catch {}
      return g;
    })
    .catch(() => ({} as Geo));
  return geoPromise;
};

/**
 * Joins the global presence channel and broadcasts what the listener is playing.
 */
export const useLivePresence = (
  enabled = true,
  meta?: { songId?: string; songTitle?: string; songArtist?: string; coverArt?: string }
) => {
  const idRef = useRef<string>(`${Math.random().toString(36).slice(2)}-${Date.now()}`);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const subscribedRef = useRef(false);
  const geoRef = useRef<Geo>({});
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const trackNow = () => {
    const ch = channelRef.current;
    if (!ch || !subscribedRef.current) return;
    const m = metaRef.current;
    ch.track({
      joined_at: Date.now(),
      device: detectDevice(),
      country: geoRef.current.country,
      city: geoRef.current.city,
      region: geoRef.current.region,
      song_id: m?.songId,
      song_title: m?.songTitle,
      song_artist: m?.songArtist,
      cover_art: m?.coverArt,
    }).catch(() => {});
  };

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: idRef.current } },
    });
    channelRef.current = channel;
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        subscribedRef.current = true;
        const g = await getGeo();
        if (cancelled) return;
        geoRef.current = g;
        trackNow();
      }
    });
    return () => {
      cancelled = true;
      subscribedRef.current = false;
      try { supabase.removeChannel(channel); } catch {}
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Re-broadcast when current song changes
  useEffect(() => {
    trackNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta?.songId, meta?.songTitle, meta?.songArtist, meta?.coverArt]);
};

/** Counts active listeners via the presence channel. */
export const useLiveListenerCount = () => {
  const listeners = useLiveListeners();
  return listeners.length;
};

/** Returns the full list of currently connected listeners with their now-playing. */
export const useLiveListeners = () => {
  const [listeners, setListeners] = useState<LiveListener[]>([]);

  useEffect(() => {
    const channel = supabase.channel(CHANNEL_NAME);
    const sync = () => {
      const state = channel.presenceState() as Record<string, any[]>;
      const arr: LiveListener[] = [];
      for (const [key, metas] of Object.entries(state)) {
        const m = metas[0] || {};
        arr.push({
          id: key,
          joined_at: m.joined_at ?? Date.now(),
          song_id: m.song_id,
          song_title: m.song_title,
          song_artist: m.song_artist,
          cover_art: m.cover_art,
          country: m.country,
          city: m.city,
          region: m.region,
          device: m.device,
        });
      }
      setListeners(arr);
    };
    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  return listeners;
};
