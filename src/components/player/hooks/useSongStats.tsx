import { useState, useEffect, useCallback } from 'react';
import { Song } from '../../../data/musicData';
import { supabase } from '@/integrations/supabase/client';

const LIKED_KEY = 'songLikedSet';

const readLikedSet = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeLikedSet = (set: Record<string, boolean>) => {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(set));
  } catch { /* ignore */ }
};

export const useSongStats = (currentSong: Song | null) => {
  const [playCount, setPlayCount] = useState<number>(0);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [heartAnimation, setHeartAnimation] = useState(false);

  // Load fresh DB values + subscribe to realtime updates for the current song
  useEffect(() => {
    if (!currentSong) return;
    let alive = true;

    setPlayCount(currentSong.playCount || 0);
    setLikesCount(currentSong.likesCount || 0);
    setLiked(!!readLikedSet()[currentSong.id]);

    // Initial fresh fetch
    (async () => {
      const { data } = await (supabase as any)
        .from('songs')
        .select('play_count,likes_count')
        .eq('id', currentSong.id)
        .maybeSingle();
      if (!alive || !data) return;
      setPlayCount(data.play_count ?? 0);
      setLikesCount(data.likes_count ?? 0);
    })();

    const channel = supabase
      .channel(`song-stats-${currentSong.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'songs', filter: `id=eq.${currentSong.id}` },
        (payload: any) => {
          const n = payload.new ?? {};
          if (typeof n.play_count === 'number') setPlayCount(n.play_count);
          if (typeof n.likes_count === 'number') setLikesCount(n.likes_count);
        })
      .subscribe();

    return () => { alive = false; supabase.removeChannel(channel); };
  }, [currentSong]);

  const toggleLike = useCallback(async () => {
    if (!currentSong) return;
    const songId = currentSong.id;

    const likedSet = readLikedSet();
    const wasLiked = !!likedSet[songId];

    if (wasLiked) delete likedSet[songId];
    else {
      likedSet[songId] = true;
      setHeartAnimation(true);
      setTimeout(() => setHeartAnimation(false), 1000);
    }
    writeLikedSet(likedSet);
    setLiked(!wasLiked);
    // Optimistic
    setLikesCount((prev) => Math.max(0, prev + (wasLiked ? -1 : 1)));

    // Persist to DB so all listeners see it in realtime
    try {
      await supabase.functions.invoke('toggle-like', {
        body: { songId, liked: !wasLiked },
      });
    } catch { /* realtime will reconcile */ }
  }, [currentSong]);

  return { playCount, likesCount, liked, heartAnimation, toggleLike };
};
