ALTER TABLE public.artist_profile
  ADD COLUMN IF NOT EXISTS mailing_modal_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mailing_required boolean NOT NULL DEFAULT false;