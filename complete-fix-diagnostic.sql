-- ==========================================
-- COMPLETE DIAGNOSTIC AND FIX
-- Run this step by step and check results
-- ==========================================

-- STEP 1: Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_table_exists;

-- STEP 2: Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- STEP 3: Check all users in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- STEP 4: Check all profiles
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- STEP 5: Check which users are missing profiles
SELECT 
  u.id,
  u.email as user_email,
  u.created_at,
  p.email as profile_email,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING PROFILE'
    WHEN p.role = 'admin' THEN '✅ ADMIN'
    ELSE '✅ USER'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- STEP 6: Check RLS policies on profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as operation
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- ==========================================
-- FIX SECTION - Run if issues found above
-- ==========================================

-- FIX 1: Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIX 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- FIX 3: Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- FIX 4: Create correct policies
-- IMPORTANT: Users must be able to INSERT and SELECT their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- FIX 5: Create trigger for auto-profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FIX 6: Create profiles for ALL existing users (INCLUDING YOU!)
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'last_name', 'Name'),
  'user'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;

-- FIX 7: Set YOUR email as admin (CHANGE THIS!)
UPDATE public.profiles 
SET 
  role = 'admin', 
  first_name = 'Admin',
  last_name = 'User',
  updated_at = NOW()
WHERE email = 'admin@homeopathway.com';  -- ⚠️ CHANGE THIS TO YOUR ACTUAL EMAIL!

-- ==========================================
-- VERIFY FIXES
-- ==========================================

-- Verify 1: Check policies are correct
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname ILIKE '%insert%' THEN '✅ CAN CREATE PROFILE'
    WHEN policyname ILIKE '%view%own%' THEN '✅ CAN READ OWN'
    WHEN policyname ILIKE '%update%own%' THEN '✅ CAN UPDATE OWN'
    WHEN policyname ILIKE '%admin%' THEN '✅ ADMIN ACCESS'
    ELSE '❓ ' || policyname
  END as description
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Verify 2: Check all users have profiles
SELECT 
  u.email,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE - RUN FIX 6!'
    WHEN p.role = 'admin' THEN '✅ 👑 ADMIN READY'
    WHEN p.role = 'user' THEN '✅ 👤 USER READY'
    ELSE '⚠️ INVALID ROLE'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.role DESC NULLS LAST;

-- Verify 3: Confirm your admin user is ready
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅✅✅ YOU ARE ADMIN - LOGIN SHOULD WORK!'
    ELSE '❌ NOT ADMIN - CHECK FIX 7'
  END as final_status
FROM public.profiles
WHERE email = 'admin@homeopathway.com'  -- ⚠️ CHANGE THIS TO YOUR EMAIL!
OR role = 'admin';

-- ==========================================
-- FINAL CHECK
-- ==========================================
SELECT 
  '✅ Setup Complete!' as message,
  COUNT(*) as total_users,
  COUNT(CASE WHEN p.role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN p.role = 'user' THEN 1 END) as users
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
