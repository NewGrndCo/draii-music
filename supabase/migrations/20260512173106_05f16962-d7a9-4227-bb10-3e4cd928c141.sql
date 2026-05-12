-- Explicit deny policies for mailing_list to satisfy defense-in-depth
-- (RLS already denies by default with no policy, but explicit restrictive
-- policies prevent accidental future exposure.)

CREATE POLICY "No one can read mailing list via client"
ON public.mailing_list
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "No one can update mailing list via client"
ON public.mailing_list
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "No one can delete mailing list via client"
ON public.mailing_list
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (false);