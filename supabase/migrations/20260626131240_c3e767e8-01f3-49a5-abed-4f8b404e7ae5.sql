
-- =========================================================
-- Phase 1: Professional music release management schema
-- Adds new normalized structure alongside existing songs columns.
-- Existing data is preserved and auto-migrated. No drops.
-- =========================================================

-- 1. Rename existing planner table (was previously called `releases`)
ALTER TABLE IF EXISTS public.releases RENAME TO release_plans;
-- Rename its policy too
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='release_plans' AND policyname='Releases are publicly readable') THEN
    ALTER POLICY "Releases are publicly readable" ON public.release_plans RENAME TO "Release plans are publicly readable";
  END IF;
END $$;

-- 2. Enums
DO $$ BEGIN
  CREATE TYPE public.release_type AS ENUM ('single','ep','album','compilation','collaboration','mixtape');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.release_status AS ENUM ('draft','scheduled','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.release_visibility AS ENUM ('public','unlisted','private');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.artist_role AS ENUM ('primary','featured','producer','composer','remixer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Releases (the new music release entity)
CREATE TABLE public.releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  type public.release_type NOT NULL DEFAULT 'single',
  primary_artist text NOT NULL,
  cover_path text,
  description text,
  release_date timestamptz,
  label text,
  upc text,
  copyright text,
  status public.release_status NOT NULL DEFAULT 'published',
  visibility public.release_visibility NOT NULL DEFAULT 'public',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.releases TO anon, authenticated;
GRANT ALL ON public.releases TO service_role;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public releases are readable" ON public.releases
  FOR SELECT USING (visibility = 'public' AND status = 'published');
CREATE INDEX idx_releases_type ON public.releases(type);
CREATE INDEX idx_releases_status_visibility ON public.releases(status, visibility);
CREATE INDEX idx_releases_release_date ON public.releases(release_date DESC NULLS LAST);
CREATE TRIGGER trg_releases_updated_at BEFORE UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Release ↔ Song join with track ordering
CREATE TABLE public.release_tracks (
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  track_number integer NOT NULL DEFAULT 1,
  disc_number integer NOT NULL DEFAULT 1,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (release_id, song_id),
  UNIQUE (release_id, disc_number, track_number)
);
GRANT SELECT ON public.release_tracks TO anon, authenticated;
GRANT ALL ON public.release_tracks TO service_role;
ALTER TABLE public.release_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Release tracks readable when release public" ON public.release_tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id
            AND r.visibility = 'public' AND r.status = 'published')
  );
CREATE INDEX idx_release_tracks_song ON public.release_tracks(song_id);

-- 5. Song artists (replaces regex-based collaboration detection)
CREATE TABLE public.song_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  name text NOT NULL,
  role public.artist_role NOT NULL DEFAULT 'featured',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (song_id, name, role)
);
GRANT SELECT ON public.song_artists TO anon, authenticated;
GRANT ALL ON public.song_artists TO service_role;
ALTER TABLE public.song_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Song artists publicly readable" ON public.song_artists
  FOR SELECT USING (true);
CREATE INDEX idx_song_artists_song ON public.song_artists(song_id);
CREATE INDEX idx_song_artists_name ON public.song_artists(lower(name));

-- 6. Genres (normalized taxonomy)
CREATE TABLE public.genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.genres TO anon, authenticated;
GRANT ALL ON public.genres TO service_role;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Genres publicly readable" ON public.genres FOR SELECT USING (true);

CREATE TABLE public.song_genres (
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  genre_id uuid NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (song_id, genre_id)
);
GRANT SELECT ON public.song_genres TO anon, authenticated;
GRANT ALL ON public.song_genres TO service_role;
ALTER TABLE public.song_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Song genres publicly readable" ON public.song_genres FOR SELECT USING (true);

-- 7. New optional song metadata
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS lyrics text,
  ADD COLUMN IF NOT EXISTS isrc text,
  ADD COLUMN IF NOT EXISTS explicit boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS composer text,
  ADD COLUMN IF NOT EXISTS producer text;

-- 8. Protect analytics from orphaning
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='listens' AND constraint_type='FOREIGN KEY'
      AND constraint_name='listens_song_id_fkey'
  ) THEN
    ALTER TABLE public.listens
      ADD CONSTRAINT listens_song_id_fkey
      FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='donations' AND constraint_type='FOREIGN KEY'
      AND constraint_name='donations_song_id_fkey'
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_song_id_fkey
      FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================
-- 9. Auto-migrate existing data into new tables
-- =========================================================
DO $$
DECLARE
  parent_ids uuid[];
  r record;
  new_release_id uuid;
  candidate_slug text;
  i int;
BEGIN
  SELECT COALESCE(array_agg(DISTINCT album_id), ARRAY[]::uuid[])
    INTO parent_ids
    FROM public.songs
   WHERE album_id IS NOT NULL;

  -- 9a. Shells (rows referenced as album_id by other songs) → releases (preserve id + slug)
  FOR r IN
    SELECT * FROM public.songs WHERE id = ANY(parent_ids)
  LOOP
    candidate_slug := COALESCE(NULLIF(r.slug, ''), public.slugify(r.title));
    IF candidate_slug IS NULL OR candidate_slug = '' THEN
      candidate_slug := substr(replace(r.id::text, '-', ''), 1, 8);
    END IF;
    i := 0;
    WHILE EXISTS (SELECT 1 FROM public.releases WHERE slug = candidate_slug) LOOP
      i := i + 1;
      candidate_slug := COALESCE(NULLIF(r.slug, ''), public.slugify(r.title)) || '-' || i;
    END LOOP;

    INSERT INTO public.releases (
      id, slug, title, type, primary_artist, cover_path,
      description, release_date, status, visibility, created_at, updated_at
    ) VALUES (
      r.id,
      candidate_slug,
      COALESCE(NULLIF(r.title, ''), 'Untitled'),
      CASE LOWER(COALESCE(r.category,''))
        WHEN 'album' THEN 'album'::public.release_type
        WHEN 'ep'    THEN 'ep'::public.release_type
        WHEN 'project' THEN 'ep'::public.release_type
        ELSE 'album'::public.release_type
      END,
      COALESCE(NULLIF(r.artist, ''), 'Unknown Artist'),
      r.thumbnail_path,
      r.description,
      r.release_date,
      'published'::public.release_status,
      'public'::public.release_visibility,
      r.created_at,
      r.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- 9b. Child tracks → release_tracks ordered by created_at
  INSERT INTO public.release_tracks (release_id, song_id, track_number, disc_number, hidden)
  SELECT
    s.album_id,
    s.id,
    row_number() OVER (PARTITION BY s.album_id ORDER BY s.created_at ASC),
    1,
    false
  FROM public.songs s
  WHERE s.album_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- 9c. Shells that also have audio (title track) → also a release_track of itself
  INSERT INTO public.release_tracks (release_id, song_id, track_number, disc_number, hidden)
  SELECT s.id, s.id, 0, 1, false
  FROM public.songs s
  JOIN public.releases rel ON rel.id = s.id
  WHERE s.file_path IS NOT NULL AND s.file_path <> ''
  ON CONFLICT DO NOTHING;

  -- 9d. Standalone audio songs (no album_id, not a shell) → single releases
  FOR r IN
    SELECT * FROM public.songs s
    WHERE s.album_id IS NULL
      AND s.id <> ALL(parent_ids)
      AND s.file_path IS NOT NULL AND s.file_path <> ''
  LOOP
    new_release_id := gen_random_uuid();
    candidate_slug := COALESCE(NULLIF(r.slug, ''), public.slugify(r.title));
    IF candidate_slug IS NULL OR candidate_slug = '' THEN
      candidate_slug := substr(replace(new_release_id::text, '-', ''), 1, 8);
    END IF;
    i := 0;
    WHILE EXISTS (SELECT 1 FROM public.releases WHERE slug = candidate_slug) LOOP
      i := i + 1;
      candidate_slug := COALESCE(NULLIF(r.slug, ''), public.slugify(r.title)) || '-single' ||
                        CASE WHEN i = 1 THEN '' ELSE '-' || i END;
    END LOOP;

    INSERT INTO public.releases (
      id, slug, title, type, primary_artist, cover_path,
      description, release_date, status, visibility, created_at, updated_at
    ) VALUES (
      new_release_id,
      candidate_slug,
      COALESCE(NULLIF(r.title, ''), 'Untitled'),
      'single'::public.release_type,
      COALESCE(NULLIF(r.artist, ''), 'Unknown Artist'),
      r.thumbnail_path,
      r.description,
      r.release_date,
      'published'::public.release_status,
      'public'::public.release_visibility,
      r.created_at,
      r.updated_at
    );

    INSERT INTO public.release_tracks (release_id, song_id, track_number, disc_number, hidden)
    VALUES (new_release_id, r.id, 1, 1, false)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- 9e. Primary artists → song_artists (every audio song)
  INSERT INTO public.song_artists (song_id, name, role, sort_order)
  SELECT s.id, s.artist, 'primary'::public.artist_role, 0
  FROM public.songs s
  WHERE s.artist IS NOT NULL AND s.artist <> ''
    AND s.file_path IS NOT NULL AND s.file_path <> ''
  ON CONFLICT (song_id, name, role) DO NOTHING;

  -- 9f. Guest artists → song_artists (featured)
  INSERT INTO public.song_artists (song_id, name, role, sort_order)
  SELECT s.id, trim(g), 'featured'::public.artist_role, 1
  FROM public.songs s, unnest(s.guest_artists) AS g
  WHERE s.guest_artists IS NOT NULL
    AND array_length(s.guest_artists, 1) > 0
    AND trim(g) <> ''
  ON CONFLICT (song_id, name, role) DO NOTHING;

  -- 9g. Free-text genres → normalized genres table
  INSERT INTO public.genres (slug, name)
  SELECT DISTINCT public.slugify(s.genre), s.genre
  FROM public.songs s
  WHERE s.genre IS NOT NULL AND trim(s.genre) <> ''
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.song_genres (song_id, genre_id)
  SELECT s.id, g.id
  FROM public.songs s
  JOIN public.genres g ON g.slug = public.slugify(s.genre)
  WHERE s.genre IS NOT NULL AND trim(s.genre) <> ''
  ON CONFLICT DO NOTHING;
END $$;
