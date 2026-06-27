ALTER TABLE public.listens ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.listens ADD COLUMN IF NOT EXISTS longitude double precision;