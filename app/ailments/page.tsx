import { createClient } from '@/lib/supabase/server';
import AilmentListPage from '../../components/AilmentList';
import { Metadata } from 'next';
interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
  slug: string;
}

export const metadata: Metadata = {
  title: "Browse All Ailments - Homeopathic Treatment Database",
  description: "Explore our complete list of ailments and conditions treated with homeopathic remedies. Find natural treatments for headaches, anxiety, digestive issues, respiratory problems, and more.",
  keywords: [
    "ailments list",
    "homeopathic conditions",
    "natural treatment conditions",
    "headache treatment",
    "anxiety remedies",
    "digestive health",
    "respiratory ailments",
    "skin conditions",
    "joint pain",
    "mental health"
  ],
  openGraph: {
    title: "All Ailments - Homeopathic Treatment Database",
    description: "Browse our comprehensive database of ailments treated with homeopathic remedies. Find natural solutions for your health concerns.",
    url: "/ailments",
    images: [
      {
        url: "/og-ailments.jpg",
        width: 1200,
        height: 630,
        alt: "Homeopathway Ailments Database",
      },
    ],
  },
};

// Mock data as fallback
const mockAilments: Ailment[] = [
  { id: "1", name: "Headache", icon: "🤕", remedies_count: 12, slug: "headache" },
  { id: "2", name: "Common Cold", icon: "🤧", remedies_count: 15, slug: "common-cold" },
  { id: "3", name: "Allergies", icon: "🤒", remedies_count: 8, slug: "allergies" },
  { id: "4", name: "Anxiety", icon: "😰", remedies_count: 10, slug: "anxiety" },
  { id: "5", name: "Insomnia", icon: "😴", remedies_count: 14, slug: "insomnia" },
  { id: "6", name: "Digestive Issues", icon: "🤢", remedies_count: 18, slug: "digestive-issues" },
  { id: "7", name: "Back Pain", icon: "🧘", remedies_count: 9, slug: "back-pain" },
  { id: "8", name: "Arthritis", icon: "🦴", remedies_count: 11, slug: "arthritis" },
  { id: "9", name: "Fatigue", icon: "😫", remedies_count: 7, slug: "fatigue" },
  { id: "10", name: "Skin Conditions", icon: "🧴", remedies_count: 13, slug: "skin-conditions" },
  { id: "11", name: "Respiratory Issues", icon: "🫁", remedies_count: 16, slug: "respiratory-issues" },
  { id: "12", name: "Stress", icon: "😓", remedies_count: 10, slug: "stress" },
  { id: "13", name: "Depression", icon: "😔", remedies_count: 9, slug: "depression" },
  { id: "14", name: "Migraine", icon: "🤯", remedies_count: 14, slug: "migraine" },
  { id: "15", name: "Asthma", icon: "😮‍💨", remedies_count: 11, slug: "asthma" },
  { id: "16", name: "Eczema", icon: "🩹", remedies_count: 8, slug: "eczema" },
  { id: "17", name: "Joint Pain", icon: "💪", remedies_count: 12, slug: "joint-pain" },
  { id: "18", name: "Sinusitis", icon: "👃", remedies_count: 10, slug: "sinusitis" },
  { id: "19", name: "Constipation", icon: "🚽", remedies_count: 7, slug: "constipation" },
  { id: "20", name: "Diarrhea", icon: "💩", remedies_count: 6, slug: "diarrhea" },
  { id: "21", name: "Fever", icon: "🌡️", remedies_count: 13, slug: "fever" },
  { id: "22", name: "Cough", icon: "🤧", remedies_count: 15, slug: "cough" },
  { id: "23", name: "Acne", icon: "😣", remedies_count: 9, slug: "acne" },
  { id: "24", name: "Hair Loss", icon: "💇", remedies_count: 8, slug: "hair-loss" },
  { id: "25", name: "Menstrual Cramps", icon: "💊", remedies_count: 11, slug: "menstrual-cramps" },
  { id: "26", name: "Toothache", icon: "🦷", remedies_count: 7, slug: "toothache" },
  { id: "27", name: "Eye Strain", icon: "👁️", remedies_count: 6, slug: "eye-strain" },
  { id: "28", name: "Earache", icon: "👂", remedies_count: 8, slug: "earache" },
  { id: "29", name: "Nausea", icon: "🤮", remedies_count: 10, slug: "nausea" },
  { id: "30", name: "Vertigo", icon: "😵", remedies_count: 9, slug: "vertigo" },
];


export default async function AilmentsPage() {
  const supabase = await createClient();

  // Fetch all ailments from database
  const { data: ailmentsData, error: ailmentsError } = await supabase
    .from("ailments")
    .select("id, name, slug, icon, remedies_count")
    .order("name", { ascending: true });

  if (ailmentsError) {
    console.error("Error fetching ailments:", ailmentsError);
  }

  // Use database data if available, otherwise use mock data
  const ailments = ailmentsData && ailmentsData.length > 0 ? ailmentsData : mockAilments;

  return <AilmentListPage ailments={ailments} />;
}