
import { notFound } from 'next/navigation';
import AilmentDetailPage from '../../../components/AilmentDetailPage';
import { supabase } from '@/lib/supabaseClient';

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

interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
  description: string;
  personalizedApproach: string;
}

// Converts names to slug-safe format
function nameToSlug(name: string) {
  return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-');
}


async function getAilmentData(slug: string) {
  const name = nameToSlug(slug);
  const { data: ailmentData, error: ailmentError } = await supabase
    .from('ailments')
    .select('*')
    .ilike('name', name) // Case-insensitive name match
    .single();
  if (ailmentError || !ailmentData) {
    console.error('Error fetching ailment:', ailmentError?.message);
    return null;
  }

  const { data: remediesData, error: remediesError } = await supabase
    .from('remedies')
    .select('*')
   

  if (remediesError) {
    console.error('Error fetching remedies:', remediesError.message);
  }

  const ailment: Ailment = {
    id: ailmentData.id,
    name: ailmentData.name,
    icon: ailmentData.icon || '🩺',
    remedies_count: ailmentData.remedies_count || 0,
    description: ailmentData.description || 'No description available.',
    personalizedApproach:
      ailmentData.personalized_approach ||
      'The beauty of homeopathic treatment lies in its individualized approach. Two people with the same condition may receive different remedies based on their unique symptoms.',
  };

  const remedies: Remedy[] = (remediesData || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    icon: '🌿',
    color: 'bg-green-100',
    indication: r.key_symptoms?.[0] || 'No indication specified.',
    rating: r.average_rating || 0,
    reviewCount: r.review_count || 0,
    ailment: ailment.name,
    description: r.description || 'No description available.',
  }));

  return { ailment, remedies };
}

export default async function AilmentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } =await params;
  const data = await getAilmentData(slug);
  if (!data) notFound();


  return <AilmentDetailPage ailment={data.ailment} remedies={data.remedies} />;
}
