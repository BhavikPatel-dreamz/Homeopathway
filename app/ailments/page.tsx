import { createClient } from '@/lib/supabase/server';
import AilmentListPage from '../../components/AilmentList';

// Mock data as fallback
const mockAilments = [
  { id: "1", name: "Headache", icon: "🤕", remedies_count: 12 },
  { id: "2", name: "Common Cold", icon: "🤧", remedies_count: 15 },
  { id: "3", name: "Allergies", icon: "🤒", remedies_count: 8 },
  { id: "4", name: "Anxiety", icon: "😰", remedies_count: 10 },
  { id: "5", name: "Insomnia", icon: "😴", remedies_count: 14 },
  { id: "6", name: "Digestive Issues", icon: "🤢", remedies_count: 18 },
  { id: "7", name: "Back Pain", icon: "🧘", remedies_count: 9 },
  { id: "8", name: "Arthritis", icon: "🦴", remedies_count: 11 },
  { id: "9", name: "Fatigue", icon: "😫", remedies_count: 7 },
  { id: "10", name: "Skin Conditions", icon: "🧴", remedies_count: 13 },
  { id: "11", name: "Respiratory Issues", icon: "🫁", remedies_count: 16 },
  { id: "12", name: "Stress", icon: "😓", remedies_count: 10 },
  { id: "13", name: "Depression", icon: "😔", remedies_count: 9 },
  { id: "14", name: "Migraine", icon: "🤯", remedies_count: 14 },
  { id: "15", name: "Asthma", icon: "😮‍💨", remedies_count: 11 },
  { id: "16", name: "Eczema", icon: "🩹", remedies_count: 8 },
  { id: "17", name: "Joint Pain", icon: "💪", remedies_count: 12 },
  { id: "18", name: "Sinusitis", icon: "👃", remedies_count: 10 },
  { id: "19", name: "Constipation", icon: "🚽", remedies_count: 7 },
  { id: "20", name: "Diarrhea", icon: "💩", remedies_count: 6 },
  { id: "21", name: "Fever", icon: "🌡️", remedies_count: 13 },
  { id: "22", name: "Cough", icon: "🤧", remedies_count: 15 },
  { id: "23", name: "Acne", icon: "😣", remedies_count: 9 },
  { id: "24", name: "Hair Loss", icon: "💇", remedies_count: 8 },
  { id: "25", name: "Menstrual Cramps", icon: "💊", remedies_count: 11 },
  { id: "26", name: "Toothache", icon: "🦷", remedies_count: 7 },
  { id: "27", name: "Eye Strain", icon: "👁️", remedies_count: 6 },
  { id: "28", name: "Earache", icon: "👂", remedies_count: 8 },
  { id: "29", name: "Nausea", icon: "🤮", remedies_count: 10 },
  { id: "30", name: "Vertigo", icon: "😵", remedies_count: 9 },
];

export default async function AilmentsPage() {
  const supabase = await createClient();

  // Fetch all ailments from database
  const { data: ailmentsData, error: ailmentsError } = await supabase
    .from("ailments")
    .select("id, name, icon, remedies_count")
    .order("name", { ascending: true });

  if (ailmentsError) {
    console.error("Error fetching ailments:", ailmentsError);
  }

  // Use database data if available, otherwise use mock data
  const ailments = ailmentsData && ailmentsData.length > 0 ? ailmentsData : mockAilments;

  return <AilmentListPage ailments={ailments} />;
}