-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view advertisements
CREATE POLICY "Anyone can view advertisements" 
ON public.advertisements 
FOR SELECT 
USING (true);

-- Only authenticated users can insert advertisements (for admin)
CREATE POLICY "Authenticated users can create advertisements" 
ON public.advertisements 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can update advertisements
CREATE POLICY "Authenticated users can update advertisements" 
ON public.advertisements 
FOR UPDATE 
USING (true);

-- Only authenticated users can delete advertisements
CREATE POLICY "Authenticated users can delete advertisements" 
ON public.advertisements 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();