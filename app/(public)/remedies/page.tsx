import { createClient } from '@/lib/supabase/server';
import RemedyListPage from '../../../components/RemedyList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Homeopathic Remedies Database - Natural Medicine Solutions",
  description: "Discover our comprehensive collection of homeopathic remedies including Arnica Montana, Belladonna, Nux Vomica, and more. Read reviews, ratings, and detailed descriptions for each remedy.",
  keywords: [
    "homeopathic remedies",
    "Arnica Montana",
    "Belladonna",
    "Nux Vomica",
    "Pulsatilla",
    "Ignatia Amara",
    "natural medicine",
    "homeopathy database",
    "remedy reviews",
    "natural treatments"
  ],
  openGraph: {
    title: "Homeopathic Remedies Database - Natural Medicine Solutions",
    description: "Browse our extensive collection of homeopathic remedies with user reviews and ratings. Find the right natural treatment for your health needs.",
    url: "/remedies",
    images: [
      {
        url: "/og-remedies.jpg",
        width: 1200,
        height: 630,
        alt: "Homeopathway Remedies Database",
      },
    ],
  },
};

// Mock data as fallback - matches the structure expected by RemedyListPage, including 'icon'
const mockRemedies: { id: string; name: string; slug: string; indication: string; description: string; icon: string; average_rating: number; review_count: number; rating: number; reviewCount: number; }[] = [
  { id: "1", name: "Arnica Montana", slug: "arnica-montana", indication: "Injuries", description: "For bruises, sprains, and muscle soreness.", icon: "🌿", average_rating: 4.8, review_count: 320, rating: 4.8, reviewCount: 320 },
  { id: "2", name: "Belladonna", slug: "belladonna", indication: "Fever", description: "For sudden high fever, redness, and throbbing pain.", icon: "🌿", average_rating: 4.7, review_count: 280, rating: 4.7, reviewCount: 280 },
  { id: "3", name: "Nux Vomica", slug: "nux-vomica", indication: "Digestive issues", description: "For indigestion, nausea, and hangovers.", icon: "🌿", average_rating: 4.6, review_count: 410, rating: 4.6, reviewCount: 410 },
  { id: "4", name: "Pulsatilla", slug: "pulsatilla", indication: "Colds", description: "For colds with thick, yellow-green mucus.", icon: "🌿", average_rating: 4.5, review_count: 190, rating: 4.5, reviewCount: 190 },
  { id: "5", name: "Ignatia Amara", slug: "ignatia-amara", indication: "Emotional stress", description: "For grief, anxiety, and emotional stress.", icon: "🌿", average_rating: 4.9, review_count: 350, rating: 4.9, reviewCount: 350 },
  { id: "6", name: "Chamomilla", slug: "chamomilla", indication: "Teething", description: "For teething pain and irritability in children.", icon: "🌿", average_rating: 4.8, review_count: 250, rating: 4.8, reviewCount: 250 },
  { id: "7", name: "Gelsemium", slug: "gelsemium", indication: "Flu", description: "For flu with weakness, dizziness, and drowsiness.", icon: "🌿", average_rating: 4.6, review_count: 180, rating: 4.6, reviewCount: 180 },
  { id: "8", name: "Rhus Tox", slug: "rhus-tox", indication: "Joint pain", description: "For joint pain that is worse on initial movement.", icon: "🌿", average_rating: 4.7, review_count: 220, rating: 4.7, reviewCount: 220 },
  { id: "9", name: "Sulphur", slug: "sulphur", indication: "Skin conditions", description: "For skin rashes that are itchy and burn.", icon: "🌿", average_rating: 4.4, review_count: 300, rating: 4.4, reviewCount: 300 },
  { id: "10", name: "Lycopodium", slug: "lycopodium", indication: "Digestive issues", description: "For digestive issues with bloating and gas.", icon: "🌿", average_rating: 4.5, review_count: 260, rating: 4.5, reviewCount: 260 },
  { id: "11", name: "Aconitum Napellus", slug: "aconitum-napellus", indication: "Sudden illness", description: "For sudden onset of fear, anxiety, or fever.", icon: "🌿", average_rating: 4.7, review_count: 150, rating: 4.7, reviewCount: 150 },
  { id: "12", name: "Apis Mellifica", slug: "apis-mellifica", indication: "Insect bites", description: "For insect bites, hives, and swelling.", icon: "🌿", average_rating: 4.8, review_count: 210, rating: 4.8, reviewCount: 210 },
  { id: "13", name: "Bryonia Alba", slug: "bryonia-alba", indication: "Cough", description: "For dry cough and pain worse with motion.", icon: "🌿", average_rating: 4.6, review_count: 170, rating: 4.6, reviewCount: 170 },
  { id: "14", name: "Calcarea Carbonica", slug: "calcarea-carbonica", indication: "Fatigue", description: "For fatigue, anxiety, and slow metabolism.", icon: "🌿", average_rating: 4.5, review_count: 230, rating: 4.5, reviewCount: 230 },
  { id: "15", name: "Cantharis", slug: "cantharis", indication: "UTI", description: "For urinary tract infections with burning pain.", icon: "🌿", average_rating: 4.7, review_count: 140, rating: 4.7, reviewCount: 140 },
  { id: "16", name: "Carbo Vegetabilis", slug: "carbo-vegetabilis", indication: "Digestive issues", description: "For bloating, gas, and faintness.", icon: "🌿", average_rating: 4.4, review_count: 190, rating: 4.4, reviewCount: 190 },
  { id: "17", name: "Causticum", slug: "causticum", indication: "Chronic conditions", description: "For chronic conditions, paralysis, and coughs.", icon: "🌿", average_rating: 4.6, review_count: 160, rating: 4.6, reviewCount: 160 },
  { id: "18", name: "Cinchona Officinalis", slug: "cinchona-officinalis", indication: "Weakness", description: "For weakness from fluid loss, fever, and gas.", icon: "🌿", average_rating: 4.5, review_count: 130, rating: 4.5, reviewCount: 130 },
  { id: "19", name: "Drosera", slug: "drosera", indication: "Cough", description: "For deep, barking coughs, especially at night.", icon: "🌿", average_rating: 4.7, review_count: 180, rating: 4.7, reviewCount: 180 },
  { id: "20", name: "Ferrum Phosphoricum", slug: "ferrum-phosphoricum", indication: "Fever", description: "For the first stage of fever and inflammation.", icon: "🌿", average_rating: 4.6, review_count: 200, rating: 4.6, reviewCount: 200 },
  { id: "21", name: "Hepar Sulphuris Calcareum", slug: "hepar-sulphuris-calcareum", indication: "Infections", description: "For painful, infected sores and coughs.", icon: "🌿", average_rating: 4.7, review_count: 170, rating: 4.7, reviewCount: 170 },
  { id: "22", name: "Hypericum Perforatum", slug: "hypericum-perforatum", indication: "Nerve pain", description: "For nerve injuries and sharp, shooting pains.", icon: "🌿", average_rating: 4.8, review_count: 240, rating: 4.8, reviewCount: 240 },
  { id: "23", name: "Ipecacuanha", slug: "ipecacuanha", indication: "Nausea", description: "For persistent nausea and vomiting.", icon: "🌿", average_rating: 4.6, review_count: 150, rating: 4.6, reviewCount: 150 },
  { id: "24", name: "Kali Bichromicum", slug: "kali-bichromicum", indication: "Sinus issues", description: "For sinus congestion with thick, stringy mucus.", icon: "🌿", average_rating: 4.5, review_count: 190, rating: 4.5, reviewCount: 190 },
  { id: "25", name: "Lachesis Mutus", slug: "lachesis-mutus", indication: "Menopause", description: "For menopause symptoms, sore throats, and jealousy.", icon: "🌿", average_rating: 4.7, review_count: 160, rating: 4.7, reviewCount: 160 },
  { id: "26", name: "Ledum Palustre", slug: "ledum-palustre", indication: "Puncture wounds", description: "For puncture wounds and insect bites.", icon: "🌿", average_rating: 4.8, review_count: 210, rating: 4.8, reviewCount: 210 },
  { id: "27", name: "Mercurius Vivus", slug: "mercurius-vivus", indication: "Sore throat", description: "For sore throats, earaches, and mouth ulcers.", icon: "🌿", average_rating: 4.5, review_count: 180, rating: 4.5, reviewCount: 180 },
  { id: "28", name: "Natrum Muriaticum", slug: "natrum-muriaticum", indication: "Grief", description: "For grief, headaches, and cold sores.", icon: "🌿", average_rating: 4.6, review_count: 250, rating: 4.6, reviewCount: 250 },
  { id: "29", name: "Phosphorus", slug: "phosphorus", indication: "Anxiety", description: "For anxiety, respiratory issues, and bleeding.", icon: "🌿", average_rating: 4.7, review_count: 220, rating: 4.7, reviewCount: 220 },
  { id: "30", name: "Sepia", slug: "sepia", indication: "Hormonal issues", description: "For hormonal imbalances and exhaustion.", icon: "🌿", average_rating: 4.8, review_count: 270, rating: 4.8, reviewCount: 270 },
];
export default async function RemediesPage() {
  const supabase = await createClient();

  // Fetch all remedies from the database
  const { data: remediesData, error: remediesError } = await supabase
    .from("remedies")
    .select("id, name, slug, description, average_rating, review_count,icon")
    .order("average_rating", { ascending: false })
    .order("review_count", { ascending: false });

  if (remediesError) {
    console.error("Error fetching remedies:", remediesError);
    // Render with mock data as fallback
  }

  // Use database data if available, otherwise use mock data
  const remedies = remediesData && remediesData.length > 0 ? remediesData.map(remedy => ({
    id: remedy.id,
    name: remedy.name,
    slug: remedy.slug,
    indication: "General", // Add a default or infer indication if not available from DB
    description: remedy.description,
    icon: remedy.icon || "🌿", // Default icon, or fetch from DB if available
    average_rating: remedy.average_rating,
    review_count: remedy.review_count,
    rating: remedy.average_rating,
    reviewCount: remedy.review_count,
  })) : mockRemedies;

  return <RemedyListPage remedies={remedies} />;
}