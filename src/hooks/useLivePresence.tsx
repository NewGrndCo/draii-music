import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Joins a global presence channel so the admin dashboard can count
 * how many listeners are connected in real time.
 */
export const useLivePresence = (enabled = true) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
    channelRef.current = channel;
    return () => {
      try { channel.unsubscribe(); } catch {}
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [enabled]);
};

/**
 * Counts active listeners via the same presence channel.
 */
export const useLiveListenerCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('listeners-live');
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const n = Object.keys(state).length;
        setCount(n);
      })
      .subscribe();
    return () => {
      try { channel.unsubscribe(); } catch {}
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  return count;
};
