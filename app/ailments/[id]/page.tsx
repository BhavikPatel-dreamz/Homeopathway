import { notFound } from 'next/navigation';
import AilmentDetailPage from '../../../components/AilmentDetailPage';

interface Remedy {
  id: number;
  name: string;
  icon: string;
  color: string;
  indication: string;
  rating: number;
  reviewCount: number;
  ailment: string;
  description: string;
}

const dummyAilmentsForPaths = [
  { id: "d1" },
  { id: "d2" },
  { id: "d3" },
];

export async function generateStaticParams() {
  // In a real app, you'd fetch all ailment IDs from your database
  // const ailments = await supabase.from('ailments').select('id');
  // return ailments.map(a => ({ id: a.id }));

  return dummyAilmentsForPaths.map((ailment) => ({ id: ailment.id }));
}

async function getAilmentData(id: string) {
  // Dummy data for demonstration
  const dummyAilment = {
    id: "d1",
    name: "Headache",
    icon: "😣",
    remedies_count: 45,
    description: "A headache is a pain in your head or face that’s often described as a pressure that’s throbbing, constant, sharp or dull. Headaches are one of the most common pain conditions in the world. Most people experience a headache at some point in their lives.",
    personalizedApproach: "The beauty of homeopathic treatment lies in its individualized approach. Two people with headaches may receive completely different remedies based on their unique symptoms, triggers, and constitutional type. This personalized medicine has been helping people find natural relief for over 200 years."
  };
  
  const dummyRemedies: Remedy[] = [
    {
      id: 1,
      name: 'Belladonna',
      icon: '🌿',
      color: 'bg-red-100',
      indication: 'For throbbing headaches, often on the right side.',
      rating: 4.8,
      reviewCount: 1250,
      ailment: 'Headache',
      description: 'Belladonna is indicated for sudden, intense, throbbing headaches that are worse from light, noise, and jarring. The face may be flushed and red.'
    },
    {
      id: 2,
      name: 'Nux Vomica',
      icon: '🌰',
      color: 'bg-yellow-100',
      indication: 'For headaches from overindulgence or stress.',
      rating: 4.6,
      reviewCount: 980,
      ailment: 'Headache',
      description: 'Often used for headaches related to hangovers, overeating, or mental strain. The person may be irritable and sensitive to odors.'
    },
    {
      id: 3,
      name: 'Bryonia Alba',
      icon: '🌱',
      color: 'bg-green-100',
      indication: 'For "bursting" headaches, worse with any movement.',
      rating: 4.5,
      reviewCount: 760,
      ailment: 'Headache',
      description: 'Bryonia is suitable for splitting headaches where even the slightest motion, like moving the eyes, aggravates the pain. The person may be irritable and want to be left alone.'
    }
  ];
  
  return {
    ailment: dummyAilment,
    remedies: dummyRemedies,
  };
}

export default async function AilmentPage({ params }: { params: { id: string } }) {
  const data = await getAilmentData(params.id);

  if (!data) {
    notFound();
  }

  return (
    <AilmentDetailPage ailment={data.ailment} remedies={data.remedies} />
  );
}
