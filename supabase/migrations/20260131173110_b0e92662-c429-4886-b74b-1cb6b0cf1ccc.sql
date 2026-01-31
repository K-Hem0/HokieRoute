-- Create routes table for pre-defined routes
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  distance_km DECIMAL(5,2) NOT NULL,
  duration_walk_min INTEGER NOT NULL,
  duration_cycle_min INTEGER NOT NULL,
  safety_score TEXT NOT NULL CHECK (safety_score IN ('safe', 'moderate', 'caution')),
  safety_insight TEXT,
  coordinates JSONB NOT NULL,
  start_point JSONB NOT NULL,
  end_point JSONB NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on routes (public read access)
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Anyone can view routes
CREATE POLICY "Routes are viewable by everyone" 
ON public.routes 
FOR SELECT 
USING (true);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create saved_routes table for user favorites
CREATE TABLE public.saved_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, route_id)
);

-- Enable RLS on saved_routes
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved routes
CREATE POLICY "Users can view their own saved routes" 
ON public.saved_routes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can save routes
CREATE POLICY "Users can save routes" 
ON public.saved_routes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can unsave routes
CREATE POLICY "Users can unsave routes" 
ON public.saved_routes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();