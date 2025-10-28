-- ==========================================
-- DATABASE TABLES FOR HOMEOPATHWAY
-- Run this in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- 1. AILMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ailments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  remedies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.ailments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ailments" ON public.ailments FOR SELECT USING (true);
CREATE POLICY "Only admins can insert ailments" ON public.ailments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update ailments" ON public.ailments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete ailments" ON public.ailments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 2. REMEDIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  common_name TEXT,
  description TEXT,
  key_symptoms TEXT[],
  constitutional_type TEXT,
  dosage_forms TEXT[],
  safety_precautions TEXT,
  related_ailments UUID[],
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view remedies" ON public.remedies FOR SELECT USING (true);
CREATE POLICY "Only admins can insert remedies" ON public.remedies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update remedies" ON public.remedies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete remedies" ON public.remedies FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 3. AILMENT-REMEDY RELATIONSHIP TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ailment_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ailment_id UUID NOT NULL REFERENCES public.ailments(id) ON DELETE CASCADE,
  remedy_id UUID NOT NULL REFERENCES public.remedies(id) ON DELETE CASCADE,
  rank INTEGER DEFAULT 0,
  effectiveness_rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ailment_id, remedy_id)
);

ALTER TABLE public.ailment_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ailment_remedies" ON public.ailment_remedies FOR SELECT USING (true);
CREATE POLICY "Only admins can modify ailment_remedies" ON public.ailment_remedies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 4. REVIEWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remedy_id UUID NOT NULL REFERENCES public.remedies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  dosage_used TEXT,
  form_used TEXT,
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(remedy_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_ailments_name ON public.ailments(name);
CREATE INDEX IF NOT EXISTS idx_remedies_name ON public.remedies(name);
CREATE INDEX IF NOT EXISTS idx_remedies_rating ON public.remedies(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_ailment_remedies_ailment ON public.ailment_remedies(ailment_id);
CREATE INDEX IF NOT EXISTS idx_ailment_remedies_remedy ON public.ailment_remedies(remedy_id);
CREATE INDEX IF NOT EXISTS idx_reviews_remedy ON public.reviews(remedy_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- ==========================================
-- AUTO-UPDATE TRIGGERS
-- ==========================================

-- Update remedy rating when reviews change
CREATE OR REPLACE FUNCTION update_remedy_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.remedies
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE remedy_id = COALESCE(NEW.remedy_id, OLD.remedy_id)),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE remedy_id = COALESCE(NEW.remedy_id, OLD.remedy_id))
  WHERE id = COALESCE(NEW.remedy_id, OLD.remedy_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_remedy_rating ON public.reviews;
CREATE TRIGGER trigger_update_remedy_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_remedy_rating();

-- Update ailment remedies count
CREATE OR REPLACE FUNCTION update_ailment_remedies_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ailments
  SET remedies_count = (SELECT COUNT(*) FROM public.ailment_remedies WHERE ailment_id = COALESCE(NEW.ailment_id, OLD.ailment_id))
  WHERE id = COALESCE(NEW.ailment_id, OLD.ailment_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ailment_remedies_count ON public.ailment_remedies;
CREATE TRIGGER trigger_update_ailment_remedies_count
AFTER INSERT OR DELETE ON public.ailment_remedies
FOR EACH ROW EXECUTE FUNCTION update_ailment_remedies_count();

-- ==========================================
-- VERIFY TABLES
-- ==========================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'ailments', 'remedies', 'ailment_remedies', 'reviews')
ORDER BY table_name;
