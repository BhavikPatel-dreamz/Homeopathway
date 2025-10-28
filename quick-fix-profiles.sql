-- ==========================================
-- QUICK FIX: Add email field and create profiles
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Step 2: Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;

-- Step 3: Create profiles for users that don't have one (with email)
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  'user' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- Step 4: Set admin role for your admin user (REPLACE EMAIL!)
UPDATE public.profiles 
SET role = 'admin', first_name = 'Admin', last_name = 'User'
WHERE email = 'admin@homeopathway.com';

-- Step 5: Verify all users have profiles with email and role
SELECT 
  au.email as auth_email,
  p.email as profile_email,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    WHEN p.email IS NULL THEN '⚠️ NO EMAIL'
    WHEN p.role IS NULL THEN '⚠️ NO ROLE'
    WHEN p.role = 'admin' THEN '✅ 👑 ADMIN'
    ELSE '✅ 👤 USER'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY p.role DESC NULLS LAST, au.email;
