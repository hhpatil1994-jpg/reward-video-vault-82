ALTER TABLE public.ad_views ADD COLUMN IF NOT EXISTS earned boolean NOT NULL DEFAULT false;
ALTER TABLE public.ad_views DROP CONSTRAINT IF EXISTS ad_views_viewer_id_ad_id_key;