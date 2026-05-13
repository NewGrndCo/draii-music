ALTER TABLE public.artist_profile
  ADD COLUMN IF NOT EXISTS detailed_bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS artist_image_url text;

ALTER TABLE public.artist_profile
  ALTER COLUMN frontend_sections SET DEFAULT '["next_up", "events", "merch", "about"]'::jsonb;

CREATE POLICY "Anyone can leave a donation"
  ON public.donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);