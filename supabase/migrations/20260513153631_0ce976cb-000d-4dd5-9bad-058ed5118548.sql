-- Songs additions
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS is_collaboration boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_artists text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS support_fund_cents integer NOT NULL DEFAULT 0;

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  event_time time,
  location text,
  ticket_url text,
  cover_image text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active events are publicly readable"
  ON public.events FOR SELECT USING (status = 'active');

-- Merch
CREATE TABLE public.merch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  external_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.merch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active merch is publicly readable"
  ON public.merch FOR SELECT USING (active = true);

-- Donations
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_cents integer NOT NULL,
  source text NOT NULL CHECK (source IN ('stripe','crypto','pwyw','manual')),
  song_id uuid REFERENCES public.songs(id) ON DELETE SET NULL,
  donor_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
-- No public policies; admin reads via edge function with service role

-- Listens (analytics)
CREATE TABLE public.listens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid REFERENCES public.songs(id) ON DELETE SET NULL,
  country text,
  city text,
  device text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.listens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a listen"
  ON public.listens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX listens_created_at_idx ON public.listens (created_at DESC);
CREATE INDEX listens_song_id_idx ON public.listens (song_id);
CREATE INDEX listens_country_idx ON public.listens (country);

-- Artist profile (single row)
CREATE TABLE public.artist_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bio text DEFAULT '',
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  player_layout text NOT NULL DEFAULT 'normal' CHECK (player_layout IN ('normal','wide')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.artist_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artist profile is publicly readable"
  ON public.artist_profile FOR SELECT USING (true);
INSERT INTO public.artist_profile (bio, socials)
  VALUES ('', '{"twitter":"","instagram":"","youtube":"","tiktok":"","spotify":"","apple":""}'::jsonb);

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_merch_updated BEFORE UPDATE ON public.merch
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_artist_profile_updated BEFORE UPDATE ON public.artist_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_songs_updated BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('song-audio','song-audio', true),
  ('song-art','song-art', true),
  ('merch-images','merch-images', true),
  ('event-covers','event-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for these buckets
CREATE POLICY "Public can read song-audio"
  ON storage.objects FOR SELECT USING (bucket_id = 'song-audio');
CREATE POLICY "Public can read song-art"
  ON storage.objects FOR SELECT USING (bucket_id = 'song-art');
CREATE POLICY "Public can read merch-images"
  ON storage.objects FOR SELECT USING (bucket_id = 'merch-images');
CREATE POLICY "Public can read event-covers"
  ON storage.objects FOR SELECT USING (bucket_id = 'event-covers');
-- Writes happen through edge functions with the service role key.
