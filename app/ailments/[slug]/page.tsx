
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
  slug: string;
  icon: string;
  remedies_count: number;
  description: string;
  personalized_approach: string;
}

async function getAilmentData(slug: string) {
  // Fetch ailment by slug column instead of converting name
  const { data: ailmentData, error: ailmentError } = await supabase
    .from('ailments')
    .select('*')
    .eq('slug', slug) // Direct slug match
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
    slug: ailmentData.slug,
    icon: ailmentData.icon || '🩺',
    remedies_count: ailmentData.remedies_count || 0,
    description: ailmentData.description || 'No description available.',
    personalized_approach: ailmentData.personalized_approach || 'The beauty of homeopathic treatment lies in its individualized approach. Two people with the same condition may receive different remedies based on their unique symptoms.',
  };

  const remedies: Remedy[] = (remediesData || []).map((r: unknown) => {
    const remedy = r as Record<string, unknown>;
    return {
      id: remedy.id as number,
      name: remedy.name as string,
      icon: '🌿',
      color: 'bg-green-100',
      indication: (remedy.key_symptoms as string[])?.[0] || 'No indication specified.',
      rating: (remedy.average_rating as number) || 0,
      reviewCount: (remedy.review_count as number) || 0,
      ailment: ailment.name,
      description: (remedy.description as string) || 'No description available.',
    };
  });

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
