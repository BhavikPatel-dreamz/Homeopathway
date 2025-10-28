-- ==========================================
-- DIAGNOSTIC QUERIES FOR HOMEOPATHWAY
-- Run these in Supabase SQL Editor to check setup
-- ==========================================

-- 1. Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_table_exists;

-- 2. Check profiles table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. List all users from auth.users
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 4. Check if profiles exist for users
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    WHEN p.role IS NULL THEN '⚠️ NO ROLE'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 5. Check RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. Count profiles by role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- ==========================================
-- FIX: If profiles table doesn't exist, create it
-- ==========================================

-- Run this ONLY if profiles table doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add email column if it doesn't exist (for existing tables)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FIX: Create profiles for existing users
-- ==========================================

-- This will create profiles for users that don't have one
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  'user' as role  -- Default role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL  -- Only insert if profile doesn't exist
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- FIX: Set specific user as admin
-- ==========================================

-- Replace 'admin@homeopathway.com' with your admin email
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@homeopathway.com'
);

-- ==========================================
-- VERIFY: Check profiles again after fixes
-- ==========================================

SELECT 
  au.email,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '👑 ADMIN'
    WHEN p.role = 'user' THEN '👤 USER'
    ELSE '❓ UNKNOWN'
  END as role_display
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY p.role DESC, au.email;

-- ==========================================
-- RLS POLICIES (Run if needed)
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- TESTING QUERIES
-- ==========================================

-- Test if you can query profiles table
SELECT * FROM public.profiles LIMIT 5;

-- Test specific user's profile
-- Replace with your email
SELECT * FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@homeopathway.com');
