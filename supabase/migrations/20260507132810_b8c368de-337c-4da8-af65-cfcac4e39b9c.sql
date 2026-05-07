-- Track who has watched advertisements (anonymous viewer fingerprint)
CREATE TABLE IF NOT EXISTS public.ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id TEXT NOT NULL,
  ad_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(viewer_id, ad_id)
);

ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous viewers) may record an ad view
CREATE POLICY "Anyone can insert ad views"
ON public.ad_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read view records
CREATE POLICY "Admins can view all ad views"
ON public.ad_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_ad_views_viewer ON public.ad_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_ad ON public.ad_views(ad_id);
