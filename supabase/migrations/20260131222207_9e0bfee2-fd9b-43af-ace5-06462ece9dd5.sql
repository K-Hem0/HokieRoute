-- Create table for location-based safety scores from Snowflake data
CREATE TABLE public.location_safety_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  total_risk NUMERIC NOT NULL,
  safety_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.location_safety_scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access (safety data should be accessible to all)
CREATE POLICY "Location safety scores are viewable by everyone"
ON public.location_safety_scores
FOR SELECT
USING (true);

-- Create index for location-based lookups
CREATE INDEX idx_location_safety_location ON public.location_safety_scores USING gin(to_tsvector('english', location));