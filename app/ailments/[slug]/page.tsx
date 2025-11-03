
import { notFound } from 'next/navigation';
import AilmentDetailPage from '../../../components/AilmentDetailPage';
import { supabase } from '@/lib/supabaseClient';

interface Remedy {
  id: string;
  name: string;
  indication: string;
  rating: number;
  review_count: number;
  description: string;
  key_symptoms?: string[];
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
    .from('ailment_remedies')
    .select(`
      remedy_id,
      effectiveness_rating,
      notes,
      remedies:remedy_id (
        id,
        name,
        description,
        key_symptoms,
        average_rating,
        review_count
      )
    `)
    .eq('ailment_id', ailmentData.id);

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

  const remedies: Remedy[] = (remediesData || []).map((ar: unknown) => {
    const ailmentRemedy = ar as Record<string, unknown>;
    const remedy = ailmentRemedy.remedies as Record<string, unknown>;
    return {
      id: String(remedy.id),
      name: remedy.name as string,
      indication: (remedy.key_symptoms as string[])?.[0] || 'No indication specified.',
      rating: (remedy.average_rating as number) || 0,
      review_count: (remedy.review_count as number) || 0,
      description: (remedy.description as string) || 'No description available.',
      key_symptoms: (remedy.key_symptoms as string[]) || [],
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
