import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Joins a global presence channel so the admin dashboard can count
 * how many listeners are connected in real time.
 */
export const useLivePresence = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const id = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const channel = supabase.channel('listeners-live', {
      config: { presence: { key: id } },
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ joined_at: Date.now() });
      }
    });
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [enabled]);
};

/**
 * Counts active listeners via the same presence channel.
 */
export const useLiveListenerCount = () => {
  const [count, setCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase.channel('listeners-live');
    channelRef.current = channel;
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  return count;
};
