
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'donations_song_id_fkey'
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_song_id_fkey
      FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_listens_song_id    ON public.listens(song_id);
CREATE INDEX IF NOT EXISTS idx_listens_created_at ON public.listens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_song_id  ON public.donations(song_id);
CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON public.mailing_list(email);
