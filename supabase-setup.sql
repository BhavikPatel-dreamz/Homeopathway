-- ==========================================
-- Homeopathway User Creation Script
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- Create Users
-- ==========================================

-- IMPORTANT: You need to create users through Supabase Auth API or Dashboard
-- The SQL below shows the structure. Use one of these methods:

-- METHOD 1: Using Supabase Dashboard
-- 1. Go to Authentication > Users in your Supabase Dashboard
-- 2. Click "Add user" 
-- 3. Create users with these credentials:

-- User 1 (Regular User):
-- Email: user1@homeopathway.com
-- Password: User1Pass@123
-- Auto Confirm: Yes

-- User 2 (Regular User):
-- Email: user2@homeopathway.com
-- Password: User2Pass@123
-- Auto Confirm: Yes

-- Admin User:
-- Email: admin@homeopathway.com
-- Password: AdminPass@123
-- Auto Confirm: Yes

-- After creating users in the Dashboard, run this SQL to set up their profiles:

-- ==========================================
-- Insert Profiles (Run after creating auth users)
-- ==========================================

-- Note: Replace the UUIDs below with actual user IDs from auth.users table
-- To get user IDs, run: SELECT id, email FROM auth.users;

-- Example structure (you'll need to update with actual IDs):
/*
INSERT INTO public.profiles (id, first_name, last_name, role)
VALUES 
  ('USER_ID_1_FROM_AUTH_USERS', 'John', 'Doe', 'user'),
  ('USER_ID_2_FROM_AUTH_USERS', 'Jane', 'Smith', 'user'),
  ('ADMIN_ID_FROM_AUTH_USERS', 'Admin', 'User', 'admin')
ON CONFLICT (id) DO UPDATE
SET 
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;
*/

-- ==========================================
-- METHOD 2: Create users programmatically using API
-- ==========================================

-- You can also use this Node.js script (run in your terminal):
/*

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // NEVER commit this!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsers() {
  // Create User 1
  const { data: user1, error: error1 } = await supabase.auth.admin.createUser({
    email: 'user1@homeopathway.com',
    password: 'User1Pass@123',
    email_confirm: true
  });
  if (error1) console.error('Error creating user1:', error1);
  else {
    await supabase.from('profiles').insert({
      id: user1.user.id,
      first_name: 'John',
      last_name: 'Doe',
      role: 'user'
    });
    console.log('Created user1:', user1.user.email);
  }

  // Create User 2
  const { data: user2, error: error2 } = await supabase.auth.admin.createUser({
    email: 'user2@homeopathway.com',
    password: 'User2Pass@123',
    email_confirm: true
  });
  if (error2) console.error('Error creating user2:', error2);
  else {
    await supabase.from('profiles').insert({
      id: user2.user.id,
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'user'
    });
    console.log('Created user2:', user2.user.email);
  }

  // Create Admin
  const { data: admin, error: errorAdmin } = await supabase.auth.admin.createUser({
    email: 'admin@homeopathway.com',
    password: 'AdminPass@123',
    email_confirm: true
  });
  if (errorAdmin) console.error('Error creating admin:', errorAdmin);
  else {
    await supabase.from('profiles').insert({
      id: admin.user.id,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    });
    console.log('Created admin:', admin.user.email);
  }
}

createUsers();

*/

-- ==========================================
-- Verify Users (Run after creation)
-- ==========================================

-- Check all users and their profiles
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.first_name,
  p.last_name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- ==========================================
-- Update existing user to admin (if needed)
-- ==========================================

-- If you already have a user and want to make them admin:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
