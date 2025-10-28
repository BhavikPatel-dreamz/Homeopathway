-- ==========================================
-- CHECK AND FIX ADMIN USER
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. CHECK IF USER EXISTS IN AUTH.USERS
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'admin@homeopathway.com';

-- 2. CHECK IF PROFILE EXISTS
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.profiles 
WHERE email = 'admin@homeopathway.com';

-- 3. CHECK ALL USERS AND THEIR PROFILES
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ==========================================
-- FIX SCRIPT (Run only if admin user exists but has wrong role)
-- ==========================================

-- 4. IF USER EXISTS, UPDATE/CREATE PROFILE WITH ADMIN ROLE
-- First, get the user ID:
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin@homeopathway.com';
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  IF admin_user_id IS NOT NULL THEN
    -- Insert or update profile
    INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
    VALUES (
      admin_user_id,
      admin_email,
      'Admin',
      'User',
      'admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      email = admin_email,
      role = 'admin',
      updated_at = NOW();

    RAISE NOTICE 'Admin profile created/updated for user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'No user found with email: %', admin_email;
    RAISE NOTICE 'Please create the user first by registering at /register';
  END IF;
END $$;

-- 5. VERIFY THE FIX
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Admin Access Granted'
    WHEN p.role = 'user' THEN '❌ Regular User (Not Admin)'
    ELSE '❌ No Profile/Role Found'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@homeopathway.com';

-- ==========================================
-- CREATE NEW ADMIN USER (If user doesn't exist)
-- ==========================================

-- NOTE: You cannot create auth.users directly via SQL in Supabase
-- You must either:
-- 1. Register at /register page with admin@homeopathway.com
-- 2. Use Supabase Dashboard: Authentication > Users > Invite User
-- 3. After creating user, run step 4 above to set role to 'admin'

-- ==========================================
-- ALTERNATIVE: Make ANY existing user an admin
-- ==========================================

-- Replace 'user@example.com' with the actual email you want to make admin
/*
DO $$
DECLARE
  user_id UUID;
  user_email TEXT := 'user@example.com'; -- CHANGE THIS
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET role = 'admin', updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE 'User % is now an admin', user_email;
  ELSE
    RAISE NOTICE 'User not found: %', user_email;
  END IF;
END $$;
*/
