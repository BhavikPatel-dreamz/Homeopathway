-- ==========================================
-- ONE-STEP FIX FOR LOGIN ISSUES
-- Copy this ENTIRE file and run in Supabase SQL Editor
-- ==========================================

-- This script will:
-- 1. Create profiles table if missing
-- 2. Fix RLS policies (CRITICAL!)
-- 3. Create profiles for all existing users
-- 4. Set your user as admin
-- 5. Add auto-profile trigger
-- 6. Verify everything works

-- ==========================================
-- STEP 1: CREATE/FIX PROFILES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: FIX RLS POLICIES (MOST IMPORTANT!)
-- ==========================================

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create new policies
-- CRITICAL: Users MUST be able to SELECT and INSERT their own profile!
-- FIXED: Removed recursive admin policy to prevent infinite recursion

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

-- ==========================================
-- STEP 3: CREATE AUTO-PROFILE TRIGGER
-- ==========================================

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

-- ==========================================
-- STEP 4: CREATE PROFILES FOR EXISTING USERS
-- ==========================================

INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'last_name', 'Name'),
  'user'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;

-- ==========================================
-- STEP 5: SET YOUR USER AS ADMIN
-- ⚠️ CHANGE THE EMAIL BELOW TO YOUR ACTUAL EMAIL!
-- ==========================================

UPDATE public.profiles 
SET 
  role = 'admin', 
  first_name = 'Admin',
  last_name = 'User',
  updated_at = NOW()
WHERE email = 'bhavikpatel.dreamz@gmail.com';  -- ⚠️⚠️⚠️ CHANGE THIS! ⚠️⚠️⚠️

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check 1: See all users and their profiles
SELECT 
  u.email as "User Email",
  p.role as "Role",
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    WHEN p.role = 'admin' THEN '✅ 👑 ADMIN'
    WHEN p.role = 'user' THEN '✅ 👤 USER'
    ELSE '⚠️ UNKNOWN'
  END as "Status"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.role DESC NULLS LAST, u.email;

-- Check 2: Verify RLS policies
SELECT 
  policyname as "Policy Name",
  cmd as "Operation"
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Check 3: Count stats
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN p.role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN p.role = 'user' THEN 1 END) as users,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as missing_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- ==========================================
-- FINAL MESSAGE
-- ==========================================
DO $$
DECLARE
  admin_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
  SELECT COUNT(*) INTO missing_count FROM auth.users u 
    LEFT JOIN public.profiles p ON u.id = p.id 
    WHERE p.id IS NULL;
  
  IF admin_count > 0 AND missing_count = 0 THEN
    RAISE NOTICE '✅✅✅ SUCCESS! Setup complete.';
    RAISE NOTICE 'Admin users: %', admin_count;
    RAISE NOTICE 'You can now login and access the admin dashboard!';
  ELSIF missing_count > 0 THEN
    RAISE NOTICE '⚠️ Warning: % users are missing profiles', missing_count;
  ELSIF admin_count = 0 THEN
    RAISE NOTICE '⚠️ Warning: No admin users found. Check STEP 5 and change the email!';
  END IF;
END $$;
