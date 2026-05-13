-- RELEASES (Kanban board: recording → mixing → distribution → promo → released)
CREATE TABLE IF NOT EXISTS public.releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'recording',
  target_date date,
  notes text,
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Releases are publicly readable" ON public.releases;
CREATE POLICY "Releases are publicly readable" ON public.releases FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);

DROP TRIGGER IF EXISTS trg_releases_updated_at ON public.releases;
CREATE TRIGGER trg_releases_updated_at BEFORE UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EXPENSES (production / studio / promo costs)
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'production',
  occurred_at date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
-- No public policies — admin-only via service role through admin-mutate.
CREATE INDEX IF NOT EXISTS idx_expenses_occurred_at ON public.expenses(occurred_at DESC);

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MERCH CLICKS (interest signal for the demand engine)
CREATE TABLE IF NOT EXISTS public.merch_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merch_id uuid REFERENCES public.merch(id) ON DELETE CASCADE,
  song_id uuid REFERENCES public.songs(id) ON DELETE SET NULL,
  country text,
  region text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.merch_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can record a merch click" ON public.merch_clicks;
CREATE POLICY "Anyone can record a merch click" ON public.merch_clicks
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_merch_clicks_merch ON public.merch_clicks(merch_id);
CREATE INDEX IF NOT EXISTS idx_merch_clicks_created_at ON public.merch_clicks(created_at DESC);