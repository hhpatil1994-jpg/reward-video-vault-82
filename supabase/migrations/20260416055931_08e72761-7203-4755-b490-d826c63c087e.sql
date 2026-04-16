
-- Drop old permissive write policies that still exist
DROP POLICY IF EXISTS "Authenticated users can create advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Authenticated users can update advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Authenticated users can delete advertisements" ON public.advertisements;

-- Drop old permissive storage delete policy
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
