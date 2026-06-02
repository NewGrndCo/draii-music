-- Hot read paths: optimize the queries actually issued by the frontend
-- and the admin stats edge function.

-- useMusicLibrary: SELECT ... FROM songs ORDER BY created_at DESC LIMIT 200
CREATE INDEX IF NOT EXISTS idx_songs_created_at
  ON public.songs (created_at DESC);

-- UpcomingEvents: WHERE status='active' AND event_date >= today ORDER BY event_date ASC
CREATE INDEX IF NOT EXISTS idx_events_status_event_date
  ON public.events (status, event_date);

-- UpcomingMerch: WHERE active=true ORDER BY sort_order ASC
CREATE INDEX IF NOT EXISTS idx_merch_active_sort_order
  ON public.merch (active, sort_order);

-- Admin stats: donations.select(... created_at)
CREATE INDEX IF NOT EXISTS idx_donations_created_at
  ON public.donations (created_at DESC);

-- merch_clicks attribution by song
CREATE INDEX IF NOT EXISTS idx_merch_clicks_song
  ON public.merch_clicks (song_id);

-- Cleanup: drop duplicate listens indexes (kept the idx_* versions which
-- already cover the same columns).
DROP INDEX IF EXISTS public.listens_created_at_idx;
DROP INDEX IF EXISTS public.listens_country_idx;
DROP INDEX IF EXISTS public.listens_song_id_idx;
