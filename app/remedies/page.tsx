import { createClient } from '@/lib/supabase/server';
import RemedyListPage from '../../components/RemedyList';

// Mock data as fallback - matches the structure expected by RemedyListPage
const mockRemedies = [
  { id: "1", name: "Arnica Montana", description: "For bruises, sprains, and muscle soreness.", average_rating: 4.8, review_count: 320 },
  { id: "2", name: "Belladonna", description: "For sudden high fever, redness, and throbbing pain.", average_rating: 4.7, review_count: 280 },
  { id: "3", name: "Nux Vomica", description: "For indigestion, nausea, and hangovers.", average_rating: 4.6, review_count: 410 },
  { id: "4", name: "Pulsatilla", description: "For colds with thick, yellow-green mucus.", average_rating: 4.5, review_count: 190 },
  { id: "5", name: "Ignatia Amara", description: "For grief, anxiety, and emotional stress.", average_rating: 4.9, review_count: 350 },
  { id: "6", name: "Chamomilla", description: "For teething pain and irritability in children.", average_rating: 4.8, review_count: 250 },
  { id: "7", name: "Gelsemium", description: "For flu with weakness, dizziness, and drowsiness.", average_rating: 4.6, review_count: 180 },
  { id: "8", name: "Rhus Tox", description: "For joint pain that is worse on initial movement.", average_rating: 4.7, review_count: 220 },
  { id: "9", name: "Sulphur", description: "For skin rashes that are itchy and burn.", average_rating: 4.4, review_count: 300 },
  { id: "10", name: "Lycopodium", description: "For digestive issues with bloating and gas.", average_rating: 4.5, review_count: 260 },
  { id: "11", name: "Aconitum Napellus", description: "For sudden onset of fear, anxiety, or fever.", average_rating: 4.7, review_count: 150 },
  { id: "12", name: "Apis Mellifica", description: "For insect bites, hives, and swelling.", average_rating: 4.8, review_count: 210 },
  { id: "13", name: "Bryonia Alba", description: "For dry cough and pain worse with motion.", average_rating: 4.6, review_count: 170 },
  { id: "14", name: "Calcarea Carbonica", description: "For fatigue, anxiety, and slow metabolism.", average_rating: 4.5, review_count: 230 },
  { id: "15", name: "Cantharis", description: "For urinary tract infections with burning pain.", average_rating: 4.7, review_count: 140 },
  { id: "16", name: "Carbo Vegetabilis", description: "For bloating, gas, and faintness.", average_rating: 4.4, review_count: 190 },
  { id: "17", name: "Causticum", description: "For chronic conditions, paralysis, and coughs.", average_rating: 4.6, review_count: 160 },
  { id: "18", name: "Cinchona Officinalis", description: "For weakness from fluid loss, fever, and gas.", average_rating: 4.5, review_count: 130 },
  { id: "19", name: "Drosera", description: "For deep, barking coughs, especially at night.", average_rating: 4.7, review_count: 180 },
  { id: "20", name: "Ferrum Phosphoricum", description: "For the first stage of fever and inflammation.", average_rating: 4.6, review_count: 200 },
  { id: "21", name: "Hepar Sulphuris Calcareum", description: "For painful, infected sores and coughs.", average_rating: 4.7, review_count: 170 },
  { id: "22", name: "Hypericum Perforatum", description: "For nerve injuries and sharp, shooting pains.", average_rating: 4.8, review_count: 240 },
  { id: "23", name: "Ipecacuanha", description: "For persistent nausea and vomiting.", average_rating: 4.6, review_count: 150 },
  { id: "24", name: "Kali Bichromicum", description: "For sinus congestion with thick, stringy mucus.", average_rating: 4.5, review_count: 190 },
  { id: "25", name: "Lachesis Mutus", description: "For menopause symptoms, sore throats, and jealousy.", average_rating: 4.7, review_count: 160 },
  { id: "26", name: "Ledum Palustre", description: "For puncture wounds and insect bites.", average_rating: 4.8, review_count: 210 },
  { id: "27", name: "Mercurius Vivus", description: "For sore throats, earaches, and mouth ulcers.", average_rating: 4.5, review_count: 180 },
  { id: "28", name: "Natrum Muriaticum", description: "For grief, headaches, and cold sores.", average_rating: 4.6, review_count: 250 },
  { id: "29", name: "Phosphorus", description: "For anxiety, respiratory issues, and bleeding.", average_rating: 4.7, review_count: 220 },
  { id: "30", name: "Sepia", description: "For hormonal imbalances and exhaustion.", average_rating: 4.8, review_count: 270 },
];

export default async function RemediesPage() {
  const supabase = await createClient();

  // Fetch all remedies from the database
  const { data: remediesData, error: remediesError } = await supabase
    .from("remedies")
    .select("id, name, description, average_rating, review_count")
    .order("average_rating", { ascending: false })
    .order("review_count", { ascending: false });

  if (remediesError) {
    console.error("Error fetching remedies:", remediesError);
    // Render with mock data as fallback
    return <RemedyListPage remedies={mockRemedies} />;
  }

  // Use database data if available, otherwise use mock data
  const remedies = remediesData && remediesData.length > 0 ? remediesData : mockRemedies;

  return <RemedyListPage remedies={remedies} />;
}