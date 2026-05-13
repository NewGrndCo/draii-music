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
  device?: string;
}

const CHANNEL_NAME = 'listeners-live';

const detectDevice = () => {
  if (typeof navigator === 'undefined') return 'unknown';
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
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

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: idRef.current } },
    });
    channelRef.current = channel;
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          joined_at: Date.now(),
          device: detectDevice(),
          song_id: meta?.songId,
          song_title: meta?.songTitle,
          song_artist: meta?.songArtist,
          cover_art: meta?.coverArt,
        });
      }
    });
    return () => {
      try { supabase.removeChannel(channel); } catch {}
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Update presence payload when current song changes
  useEffect(() => {
    const ch = channelRef.current;
    if (!ch || !enabled) return;
    ch.track({
      joined_at: Date.now(),
      device: detectDevice(),
      song_id: meta?.songId,
      song_title: meta?.songTitle,
      song_artist: meta?.songArtist,
      cover_art: meta?.coverArt,
    }).catch(() => {});
  }, [enabled, meta?.songId, meta?.songTitle, meta?.songArtist, meta?.coverArt]);
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
