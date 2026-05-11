DROP POLICY IF EXISTS "Anyone can insert ad views" ON public.ad_views;

CREATE POLICY "Anyone can insert valid ad views"
ON public.ad_views
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.advertisements a WHERE a.id = ad_views.ad_id)
  AND (
    (earned = false AND points_earned = 0)
    OR (earned = true AND points_earned = (SELECT a.reward_points FROM public.advertisements a WHERE a.id = ad_views.ad_id))
  )
);