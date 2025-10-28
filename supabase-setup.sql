-- ==========================================
-- Homeopathway User Creation Script
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add email column if table exists but column doesn't
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

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

-- ==========================================
-- AILMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ailments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT, -- Emoji or icon identifier
  description TEXT,
  remedies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.ailments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view ailments" ON public.ailments;
DROP POLICY IF EXISTS "Only admins can insert ailments" ON public.ailments;
DROP POLICY IF EXISTS "Only admins can update ailments" ON public.ailments;
DROP POLICY IF EXISTS "Only admins can delete ailments" ON public.ailments;

-- RLS Policies for ailments
CREATE POLICY "Anyone can view ailments"
ON public.ailments FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert ailments"
ON public.ailments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update ailments"
ON public.ailments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete ailments"
ON public.ailments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- REMEDIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  common_name TEXT,
  description TEXT,
  key_symptoms TEXT[], -- Array of key symptoms
  constitutional_type TEXT,
  dosage_forms TEXT[], -- Array like ['30C', '200C', '6C']
  safety_precautions TEXT,
  related_ailments UUID[], -- Array of ailment IDs
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.remedies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view remedies" ON public.remedies;
DROP POLICY IF EXISTS "Only admins can insert remedies" ON public.remedies;
DROP POLICY IF EXISTS "Only admins can update remedies" ON public.remedies;
DROP POLICY IF EXISTS "Only admins can delete remedies" ON public.remedies;

-- RLS Policies for remedies
CREATE POLICY "Anyone can view remedies"
ON public.remedies FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert remedies"
ON public.remedies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update remedies"
ON public.remedies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete remedies"
ON public.remedies FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- AILMENT-REMEDY RELATIONSHIP TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ailment_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ailment_id UUID NOT NULL REFERENCES public.ailments(id) ON DELETE CASCADE,
  remedy_id UUID NOT NULL REFERENCES public.remedies(id) ON DELETE CASCADE,
  rank INTEGER DEFAULT 0, -- For ordering top remedies
  effectiveness_rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ailment_id, remedy_id)
);

-- Enable Row Level Security
ALTER TABLE public.ailment_remedies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view ailment_remedies" ON public.ailment_remedies;
DROP POLICY IF EXISTS "Only admins can modify ailment_remedies" ON public.ailment_remedies;

CREATE POLICY "Anyone can view ailment_remedies"
ON public.ailment_remedies FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify ailment_remedies"
ON public.ailment_remedies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ==========================================
-- REVIEWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remedy_id UUID NOT NULL REFERENCES public.remedies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  dosage_used TEXT, -- e.g., '30C', '200C'
  form_used TEXT, -- e.g., 'Liquid', 'Pill'
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(remedy_id, user_id) -- One review per user per remedy
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Ailments indexes
CREATE INDEX IF NOT EXISTS idx_ailments_name ON public.ailments(name);
CREATE INDEX IF NOT EXISTS idx_ailments_created_at ON public.ailments(created_at DESC);

-- Remedies indexes
CREATE INDEX IF NOT EXISTS idx_remedies_name ON public.remedies(name);
CREATE INDEX IF NOT EXISTS idx_remedies_scientific_name ON public.remedies(scientific_name);
CREATE INDEX IF NOT EXISTS idx_remedies_rating ON public.remedies(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_remedies_created_at ON public.remedies(created_at DESC);

-- Ailment-Remedy relationship indexes
CREATE INDEX IF NOT EXISTS idx_ailment_remedies_ailment ON public.ailment_remedies(ailment_id);
CREATE INDEX IF NOT EXISTS idx_ailment_remedies_remedy ON public.ailment_remedies(remedy_id);
CREATE INDEX IF NOT EXISTS idx_ailment_remedies_rank ON public.ailment_remedies(ailment_id, rank);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_remedy ON public.reviews(remedy_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- ==========================================
-- FUNCTIONS FOR AUTO-UPDATING COUNTS
-- ==========================================

-- Function to update remedy average rating
CREATE OR REPLACE FUNCTION update_remedy_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.remedies
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE remedy_id = COALESCE(NEW.remedy_id, OLD.remedy_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE remedy_id = COALESCE(NEW.remedy_id, OLD.remedy_id)
    )
  WHERE id = COALESCE(NEW.remedy_id, OLD.remedy_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update remedy rating when review is added/updated/deleted
DROP TRIGGER IF EXISTS trigger_update_remedy_rating ON public.reviews;
CREATE TRIGGER trigger_update_remedy_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_remedy_rating();

-- Function to update ailment remedies count
CREATE OR REPLACE FUNCTION update_ailment_remedies_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ailments
  SET remedies_count = (
    SELECT COUNT(*)
    FROM public.ailment_remedies
    WHERE ailment_id = COALESCE(NEW.ailment_id, OLD.ailment_id)
  )
  WHERE id = COALESCE(NEW.ailment_id, OLD.ailment_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ailment remedies count
DROP TRIGGER IF EXISTS trigger_update_ailment_remedies_count ON public.ailment_remedies;
CREATE TRIGGER trigger_update_ailment_remedies_count
AFTER INSERT OR DELETE ON public.ailment_remedies
FOR EACH ROW
EXECUTE FUNCTION update_ailment_remedies_count();

-- ==========================================
-- SAMPLE DATA (Optional - Uncomment to insert)
-- ==========================================

/*
-- Sample Ailments
INSERT INTO public.ailments (name, icon, description) VALUES
('Headache', '🤕', 'Pain in the head or upper neck'),
('Cold & Flu', '🤧', 'Common cold and influenza symptoms'),
('Anxiety', '😰', 'Excessive worry and nervousness'),
('Insomnia', '😴', 'Difficulty falling or staying asleep'),
('Digestive Issues', '🤢', 'Problems with digestion and stomach')
ON CONFLICT (name) DO NOTHING;

-- Sample Remedies
INSERT INTO public.remedies (name, scientific_name, common_name, description, key_symptoms, dosage_forms) VALUES
(
  'Arnica Montana',
  'Arnica montana',
  'Mountain Arnica',
  'Primarily used for trauma, bruising, and muscle soreness',
  ARRAY['Bruising', 'Muscle soreness', 'Trauma', 'Shock'],
  ARRAY['30C', '200C', '6C']
),
(
  'Belladonna',
  'Atropa belladonna',
  'Deadly Nightshade',
  'Used for sudden onset conditions with heat and redness',
  ARRAY['Sudden fever', 'Throbbing headache', 'Hot skin', 'Dilated pupils'],
  ARRAY['30C', '200C']
),
(
  'Nux Vomica',
  'Strychnos nux-vomica',
  'Poison Nut',
  'Helpful for digestive issues and stress-related symptoms',
  ARRAY['Digestive upset', 'Irritability', 'Hangover', 'Constipation'],
  ARRAY['30C', '6C']
)
ON CONFLICT DO NOTHING;
*/
