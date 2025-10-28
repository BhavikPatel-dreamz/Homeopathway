-- ==========================================
-- FIX PROFILES TABLE POLICIES
-- This allows users to create their own profile on first login
-- ==========================================

-- 1. CHECK CURRENT POLICIES
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

-- 2. DROP ALL EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- 3. CREATE NEW POLICIES

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to INSERT their own profile (for auto-creation)
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. VERIFY POLICIES
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as action
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 5. TEST PROFILE ACCESS (Run this while logged in)
-- This should show your own profile
SELECT * FROM public.profiles WHERE id = auth.uid();

-- 6. ENSURE TRIGGER EXISTS FOR AUTO-PROFILE CREATION
-- This trigger creates profiles automatically when users register
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

-- 7. CREATE MISSING PROFILES FOR EXISTING USERS
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
ON CONFLICT (id) DO NOTHING;

-- 8. NOW SET YOUR USER AS ADMIN
-- Replace with your actual email
UPDATE public.profiles 
SET role = 'admin', 
    first_name = 'Admin',
    last_name = 'User',
    updated_at = NOW()
WHERE email = 'admin@homeopathway.com'; -- CHANGE THIS TO YOUR EMAIL

-- 9. VERIFY YOUR ADMIN STATUS
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  CASE 
    WHEN role = 'admin' THEN '✅ ADMIN ACCESS'
    WHEN role = 'user' THEN '👤 USER ACCESS'
    ELSE '⚠️ NO ROLE'
  END as access_level
FROM public.profiles
ORDER BY created_at DESC;
