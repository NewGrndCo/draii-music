ALTER TABLE public.listens ADD COLUMN IF NOT EXISTS region text;
CREATE INDEX IF NOT EXISTS idx_listens_region ON public.listens(region);
CREATE INDEX IF NOT EXISTS idx_listens_country ON public.listens(country);