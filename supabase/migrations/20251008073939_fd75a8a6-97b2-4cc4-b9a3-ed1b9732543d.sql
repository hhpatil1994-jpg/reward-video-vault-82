-- Add questions column to advertisements table
ALTER TABLE public.advertisements 
ADD COLUMN questions JSONB DEFAULT '[]'::jsonb;