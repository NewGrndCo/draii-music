-- Drop broad SELECT policies that allow listing files in public buckets.
-- Public URLs continue to work because public buckets serve files directly via the CDN
-- without requiring a storage.objects SELECT policy.
DROP POLICY IF EXISTS "Public can read song-audio" ON storage.objects;
DROP POLICY IF EXISTS "Public can read song-art" ON storage.objects;
DROP POLICY IF EXISTS "Public can read merch-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read event-covers" ON storage.objects;

-- Lock down the expenses table from any client (anon/authenticated) access.
-- Admin tooling uses the service role key which bypasses RLS.
CREATE POLICY "Expenses are not accessible from the client"
ON public.expenses
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
