-- The songs_set_slug_trigger is currently attached twice to the songs table.
-- Drop one copy so the slug-setting logic only runs once per row change.
DROP TRIGGER IF EXISTS songs_set_slug_trigger ON public.songs;

CREATE TRIGGER songs_set_slug_trigger
BEFORE INSERT OR UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.songs_set_slug();
