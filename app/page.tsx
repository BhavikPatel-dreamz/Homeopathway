import { createClient } from '@/lib/supabase/server';
import HomePageClient from '@/components/HomePageClient';

const dummyAilments = [
  { id: "d1", name: "Headache", icon: "😣", remedies_count: 45 },
  { id: "d2", name: "Anxiety", icon: "😰", remedies_count: 38 },
  { id: "d3", name: "Insomnia", icon: "😴", remedies_count: 42 },
  { id: "d4", name: "Cold & Flu", icon: "🤧", remedies_count: 52 },
  { id: "d5", name: "Allergies", icon: "🤧", remedies_count: 47 },
  { id: "d6", name: "Joint Pain", icon: "🦴", remedies_count: 35 },
  { id: "d7", name: "Digestion", icon: "💊", remedies_count: 41 },
  { id: "d8", name: "Cough", icon: "😷", remedies_count: 44 },
  { id: "d9", name: "Muscle Soreness", icon: "💪", remedies_count: 29 },
  { id: "d10", name: "Nasal polyps", icon: "👃", remedies_count: 18 },
  { id: "d11", name: "Sunburn", icon: "☀️", remedies_count: 22 },
  { id: "d12", name: "Back pain", icon: "🧍", remedies_count: 33 },
  { id: "d13", name: "High blood pressure", icon: "🩸", remedies_count: 31 },
  { id: "d14", name: "Urinary tract infection", icon: "💧", remedies_count: 26 },
  { id: "d15", name: "Kidney stones", icon: "🪨", remedies_count: 19 },
  { id: "d16", name: "Cuts, bruises, and burns", icon: "🔥", remedies_count: 28 },
  { id: "d17", name: "Swelling", icon: "🟡", remedies_count: 24 },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: ailmentsData, error: ailmentsError } = await supabase
    .from("ailments")
    .select("id, name, icon, remedies_count")
    .order("name", { ascending: true });

  if (ailmentsError) {
    console.error("Error fetching ailments:", ailmentsError);
  }

  const ailments = ailmentsData && ailmentsData.length > 0 ? ailmentsData : dummyAilments;

  const dummyTopRemedies = [
    { 
      name: "Nux Vomica", 
      average_rating: 5, 
      review_count: 234,
      description: "Best for nausea and acidity, especially after..."
    },
    { 
      name: "Belladonna", 
      average_rating: 5, 
      review_count: 324,
      description: "Best for sudden, intense, throbbing pain that..."
    },
    { 
      name: "Bryonia Alba", 
      average_rating: 5, 
      review_count: 324,
      description: "Best for dry coughs that worsen with movement."
    },
    { 
      name: "Coffea Cruda", 
      average_rating: 5, 
      review_count: 143,
      description: "Best for sleeplessness due to an overactive..."
    },
    { 
      name: "Gelsemium Sempervirens", 
      average_rating: 4, 
      review_count: 247,
      description: "Best for flu-like symptoms with weakness, achi..."
    },
  ];

  const { data: remediesData, error: remediesError } = await supabase
    .from("remedies")
    .select("name, average_rating, review_count, description")
    .order("average_rating", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(5);

  if (remediesError) {
    console.error("Error fetching top remedies:", remediesError);
  }

  const topRemedies = remediesData && remediesData.length > 0 ? remediesData : dummyTopRemedies;

  return (
    <>
      <HomePageClient initialAilments={ailments} initialTopRemedies={topRemedies} />
      {/* The footer can be moved into HomePageClient or kept here if it's static */}
    </>
  );
}
