ALTER TABLE public.artist_profile
ADD COLUMN IF NOT EXISTS frontend_sections jsonb NOT NULL DEFAULT '["next_up","events","merch"]'::jsonb;