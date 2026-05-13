
ALTER TABLE public.artist_profile
  ADD COLUMN IF NOT EXISTS support_fund_enabled boolean NOT NULL DEFAULT true;

UPDATE public.artist_profile
SET frontend_sections = frontend_sections || '["about"]'::jsonb
WHERE NOT (frontend_sections @> '["about"]'::jsonb);

ALTER TABLE public.songs REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'songs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.songs';
  END IF;
END $$;
