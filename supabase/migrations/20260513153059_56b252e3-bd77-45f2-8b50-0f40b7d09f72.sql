CREATE TABLE public.songs (
  id uuid PRIMARY KEY,
  title text,
  artist text,
  duration numeric,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  category text,
  release_date timestamptz,
  status text,
  album_id uuid,
  tags text[] DEFAULT '{}',
  preview_path text,
  thumbnail_path text,
  visibility text,
  description text,
  genre text,
  bpm numeric,
  play_count integer DEFAULT 0,
  likes_count integer DEFAULT 0
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Songs are publicly readable"
  ON public.songs FOR SELECT
  USING (true);
