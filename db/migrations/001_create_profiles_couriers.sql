-- Migration: create profiles and couriers tables + trigger to auto-create profiles

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  phone text,
  document text,
  avatar_url text,
  role text,
  created_at timestamptz DEFAULT now()
);

-- Create couriers table (specific data for couriers)
CREATE TABLE IF NOT EXISTS public.couriers (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_plate text,
  balance numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  total_ratings int DEFAULT 0,
  is_verified boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Function and trigger to create profile (and courier record when role='COURIER') after user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.user_metadata->>'name',''), COALESCE(NEW.user_metadata->>'role',''), now())
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(NEW.user_metadata->>'role','') ILIKE 'COURIER' THEN
    INSERT INTO public.couriers (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_profile_after_user ON auth.users;
CREATE TRIGGER create_profile_after_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
