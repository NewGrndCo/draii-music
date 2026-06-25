ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_songs_hidden ON public.songs(hidden);