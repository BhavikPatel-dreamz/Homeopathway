-- ==========================================
-- SAMPLE DATA FOR HOMEOPATHWAY
-- Run this AFTER creating tables
-- ==========================================

-- ==========================================
-- SAMPLE AILMENTS
-- ==========================================

INSERT INTO public.ailments (name, icon, description) VALUES
('Headache', '🤕', 'Pain or discomfort in the head or upper neck region'),
('Migraine', '😖', 'Severe recurring headaches often with nausea and light sensitivity'),
('Cold & Flu', '🤧', 'Common cold and influenza symptoms'),
('Sore Throat', '🗣️', 'Pain or irritation in the throat'),
('Cough', '🤢', 'Sudden expulsion of air from the lungs'),
('Fever', '🌡️', 'Elevated body temperature above normal range'),
('Anxiety', '😰', 'Excessive worry, nervousness, and unease'),
('Depression', '😔', 'Persistent feelings of sadness and loss of interest'),
('Insomnia', '😴', 'Difficulty falling or staying asleep'),
('Stress', '😫', 'Physical or emotional tension and strain'),
('Digestive Issues', '🤢', 'Problems with digestion including nausea and stomach pain'),
('Constipation', '💩', 'Difficulty passing stools or infrequent bowel movements'),
('Diarrhea', '🚽', 'Loose or watery bowel movements'),
('Nausea', '🤮', 'Feeling of sickness with an urge to vomit'),
('Back Pain', '🏥', 'Pain in the back, often in the lower back'),
('Joint Pain', '🦴', 'Discomfort or pain in joints'),
('Muscle Pain', '💪', 'Pain or discomfort in muscles'),
('Allergies', '🤧', 'Immune system reaction to foreign substances'),
('Skin Rash', '🔴', 'Area of irritated or swollen skin'),
('Eczema', '🩹', 'Inflammatory skin condition with itching and redness'),
('Acne', '😣', 'Skin condition with pimples and blemishes'),
('Menstrual Cramps', '🩸', 'Pain during menstruation'),
('PMS', '📅', 'Physical and emotional symptoms before menstruation'),
('Fatigue', '😪', 'Extreme tiredness and lack of energy'),
('Dizziness', '😵', 'Feeling of spinning or losing balance')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- SAMPLE REMEDIES
-- ==========================================

INSERT INTO public.remedies (name, scientific_name, common_name, description, key_symptoms, dosage_forms, safety_precautions) VALUES
(
  'Arnica Montana',
  'Arnica montana',
  'Mountain Arnica',
  'A leading remedy for trauma, bruising, and muscle soreness. Excellent for physical injuries and shock.',
  ARRAY['Bruising', 'Muscle soreness', 'Trauma', 'Shock', 'Overexertion', 'Black eyes'],
  ARRAY['30C', '200C', '6C', '1M'],
  'Do not apply to broken skin. Consult healthcare provider for serious injuries.'
),
(
  'Belladonna',
  'Atropa belladonna',
  'Deadly Nightshade',
  'Used for sudden onset conditions with heat, redness, and throbbing pain. Excellent for high fevers.',
  ARRAY['Sudden fever', 'Throbbing headache', 'Hot skin', 'Dilated pupils', 'Flushed face', 'Delirium'],
  ARRAY['30C', '200C', '6C'],
  'Not for use during pregnancy without professional guidance. Monitor high fevers closely.'
),
(
  'Nux Vomica',
  'Strychnos nux-vomica',
  'Poison Nut',
  'The remedy for modern lifestyle issues. Helps with digestive problems, stress, and overindulgence.',
  ARRAY['Digestive upset', 'Irritability', 'Hangover', 'Constipation', 'Insomnia', 'Oversensitivity'],
  ARRAY['30C', '200C', '6C'],
  'Avoid coffee and strong mints while using. Best taken before meals.'
),
(
  'Pulsatilla',
  'Pulsatilla pratensis',
  'Wind Flower',
  'Excellent for changeable symptoms and emotional sensitivity. Often used for children and women.',
  ARRAY['Weeping', 'Changeable moods', 'Thick discharge', 'Better in open air', 'Clingy behavior'],
  ARRAY['30C', '200C', '6C'],
  'Avoid fatty foods. Store away from strong odors.'
),
(
  'Chamomilla',
  'Matricaria chamomilla',
  'German Chamomile',
  'The remedy for irritability and pain. Especially useful for teething children and nerve pain.',
  ARRAY['Extreme irritability', 'One cheek red', 'Teething pain', 'Cannot be consoled', 'Pain unbearable'],
  ARRAY['30C', '6C', '12C'],
  'Safe for infants. Use as directed for acute symptoms.'
),
(
  'Aconitum Napellus',
  'Aconitum napellus',
  'Monkshood',
  'First remedy for sudden onset of symptoms, especially after exposure to cold or shock.',
  ARRAY['Sudden onset', 'Anxiety', 'Fear of death', 'After cold wind', 'Panic attacks', 'Fever'],
  ARRAY['30C', '200C', '6C'],
  'Use at first sign of symptoms. Best for acute conditions within first 24 hours.'
),
(
  'Rhus Toxicodendron',
  'Toxicodendron pubescens',
  'Poison Ivy',
  'For stiffness and pain that improves with motion. Excellent for joint and muscle complaints.',
  ARRAY['Stiffness', 'Better with motion', 'Worse at rest', 'Restlessness', 'Joint pain', 'Skin eruptions'],
  ARRAY['30C', '200C', '6C', '12C'],
  'Continue gentle movement. Avoid prolonged rest periods.'
),
(
  'Bryonia Alba',
  'Bryonia alba',
  'White Bryony',
  'For conditions worse with any motion. Patient wants to lie still and be left alone.',
  ARRAY['Worse with motion', 'Dry mucous membranes', 'Irritable', 'Thirsty', 'Constipation', 'Headache'],
  ARRAY['30C', '200C', '6C'],
  'Keep patient still and well-hydrated. Avoid unnecessary movement.'
),
(
  'Gelsemium',
  'Gelsemium sempervirens',
  'Yellow Jasmine',
  'For flu symptoms with weakness and trembling. Excellent for anticipatory anxiety.',
  ARRAY['Weakness', 'Trembling', 'Drowsiness', 'Dizziness', 'No thirst', 'Heavy eyelids', 'Stage fright'],
  ARRAY['30C', '200C', '6C'],
  'Rest is important. Symptoms often come on gradually.'
),
(
  'Arsenicum Album',
  'Arsenicum album',
  'White Arsenic',
  'For anxiety with restlessness. Excellent for food poisoning and digestive issues.',
  ARRAY['Anxiety', 'Restlessness', 'Burning pains', 'Better with warmth', 'Fastidious', 'Fear of death', 'Thirsty'],
  ARRAY['30C', '200C', '6C', '1M'],
  'Stay hydrated. Seek medical attention for severe symptoms.'
),
(
  'Calcarea Carbonica',
  'Calcarea carbonica',
  'Calcium Carbonate',
  'Constitutional remedy for slow development and weak bones. Good for overweight, sweaty individuals.',
  ARRAY['Slow development', 'Sweaty head', 'Overweight', 'Weak bones', 'Craves eggs', 'Stubborn'],
  ARRAY['30C', '200C', '1M'],
  'Long-term remedy. May need constitutional prescribing by professional.'
),
(
  'Sulphur',
  'Sulphur',
  'Sublimated Sulphur',
  'For skin conditions and digestive issues. Often used to complete healing of chronic conditions.',
  ARRAY['Burning sensations', 'Skin eruptions', 'Hot feet', 'Worse from heat', 'Hungry at 11am', 'Untidy'],
  ARRAY['30C', '200C', '6C'],
  'May cause temporary aggravation. Start with lower potencies.'
)
ON CONFLICT DO NOTHING;

-- ==========================================
-- LINK AILMENTS WITH REMEDIES
-- ==========================================

-- Get IDs for easier reference (you'll need to adjust these based on actual UUIDs)
-- This is a template - run after inserting data

-- Example linking (adjust remedy and ailment IDs):
/*
INSERT INTO public.ailment_remedies (ailment_id, remedy_id, rank, effectiveness_rating) 
SELECT 
  a.id,
  r.id,
  1,
  4.5
FROM public.ailments a
CROSS JOIN public.remedies r
WHERE a.name = 'Headache' AND r.name = 'Belladonna';

INSERT INTO public.ailment_remedies (ailment_id, remedy_id, rank, effectiveness_rating) 
SELECT a.id, r.id, 2, 4.3
FROM public.ailments a CROSS JOIN public.remedies r
WHERE a.name = 'Headache' AND r.name = 'Bryonia Alba';
*/

-- ==========================================
-- SAMPLE REVIEWS (Optional)
-- ==========================================

/*
-- You'll need actual user IDs from your auth.users table
INSERT INTO public.reviews (remedy_id, user_id, rating, dosage_used, form_used, review_text) 
SELECT 
  r.id,
  'USER_ID_HERE',
  5,
  '30C',
  'Pill',
  'This remedy worked wonderfully for my headache. Relief came within 30 minutes!'
FROM public.remedies r
WHERE r.name = 'Belladonna';
*/

-- ==========================================
-- VERIFY DATA
-- ==========================================

-- Count records
SELECT 
  'Ailments' as table_name, COUNT(*) as count FROM public.ailments
UNION ALL
SELECT 'Remedies', COUNT(*) FROM public.remedies
UNION ALL
SELECT 'Ailment-Remedies', COUNT(*) FROM public.ailment_remedies
UNION ALL
SELECT 'Reviews', COUNT(*) FROM public.reviews;

-- View sample data
SELECT * FROM public.ailments LIMIT 5;
SELECT * FROM public.remedies LIMIT 5;
