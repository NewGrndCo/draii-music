
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )
  );
$$;

-- Backfill: base slug from title, append short id suffix only if collision
WITH base AS (
  SELECT id,
         NULLIF(public.slugify(title), '') AS s,
         substr(replace(id::text, '-', ''), 1, 5) AS suf
  FROM public.songs
  WHERE slug IS NULL OR slug = ''
)
UPDATE public.songs t
SET slug = CASE
  WHEN b.s IS NULL THEN b.suf
  ELSE b.s
END
FROM base b
WHERE t.id = b.id;

-- Resolve duplicates by appending short id suffix
WITH dups AS (
  SELECT id, slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at) AS rn,
         substr(replace(id::text, '-', ''), 1, 5) AS suf
  FROM public.songs
  WHERE slug IS NOT NULL
)
UPDATE public.songs t
SET slug = d.slug || '-' || d.suf
FROM dups d
WHERE t.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS songs_slug_unique ON public.songs(slug) WHERE slug IS NOT NULL;

-- Trigger to auto-generate slug for new songs
CREATE OR REPLACE FUNCTION public.songs_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  candidate text;
  i int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := NULLIF(public.slugify(NEW.title), '');
    IF base_slug IS NULL THEN
      base_slug := substr(replace(NEW.id::text, '-', ''), 1, 6);
    END IF;
    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.songs WHERE slug = candidate AND id <> NEW.id) LOOP
      i := i + 1;
      candidate := base_slug || '-' || substr(replace(NEW.id::text, '-', ''), 1, 4 + i);
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS songs_set_slug_trigger ON public.songs;
CREATE TRIGGER songs_set_slug_trigger
BEFORE INSERT OR UPDATE OF title, slug ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.songs_set_slug();
