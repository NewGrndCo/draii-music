ALTER TABLE public.artist_profile
  ADD COLUMN IF NOT EXISTS stripe_payment_link text;