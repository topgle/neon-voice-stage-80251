-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Update existing songs with NULL user_id to system admin
-- First, we need to ensure there's at least one admin user in the future
-- For now, just set a placeholder UUID
UPDATE public.songs 
SET user_id = '00000000-0000-0000-0000-000000000000' 
WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE public.songs 
ALTER COLUMN user_id SET NOT NULL;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Users can update own songs" ON public.songs;
DROP POLICY IF EXISTS "Users can delete own songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can add songs" ON public.songs;

-- Create strict policies for songs
CREATE POLICY "Users can update own songs"
ON public.songs FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own songs"
ON public.songs FOR DELETE
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Authenticated users can add songs"
ON public.songs FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Admins can manage all songs
CREATE POLICY "Admins can insert any song"
ON public.songs FOR INSERT
WITH CHECK (public.is_admin());

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();