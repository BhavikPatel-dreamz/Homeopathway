import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import RemediesDetail from '@/components/RemediesDetail';
import { getReviewStats } from '@/lib/review';
import { Remedy, Ailment } from '@/types';

async function getRemedyData(ailmentSlug: string, remedySlug: string) {
  // First, get the ailment to verify it exists
  const { data: ailmentData, error: ailmentError } = await supabase
    .from('ailments')
    .select('id, name, slug, icon')
    .eq('slug', ailmentSlug)
    .single();

  if (ailmentError || !ailmentData) {
    console.error('Error fetching ailment:', ailmentError?.message);
    return null;
  }

  // Then get the remedy and verify it's associated with this ailment
  const { data: remedyData, error: remedyError } = await supabase
    .from('remedies')
    .select('*')
    .eq('slug', remedySlug)
    .single();

  if (remedyError || !remedyData) {
    console.error('Error fetching remedy:', remedyError?.message);
    return null;
  }

  // Check if this remedy is associated with this ailment
  const { data: associationData, error: associationError } = await supabase
    .from('ailment_remedies')
    .select('*')
    .eq('ailment_id', ailmentData.id)
    .eq('remedy_id', remedyData.id)
    .single();

  if (associationError || !associationData) {
    console.error('Remedy not associated with this ailment');
    return null;
  }

  // Get related remedies for this ailment
  const { data: relatedRemediesData } = await supabase
    .from('ailment_remedies')
    .select(`
      remedy_id,
      remedies:remedy_id (
        id,
        name,
        slug,
        icon,
        average_rating,
        review_count,
        description,
        key_symptoms
      )
    `)
    .eq('ailment_id', ailmentData.id)
    .neq('remedy_id', remedyData.id)
    .limit(3);

  const ailment: Ailment = {
    id: ailmentData.id,
    name: ailmentData.name,
    slug: ailmentData.slug,
    icon: ailmentData.icon || '🩺',
    remedies_count: 0, // Not needed for this context
  };

  const remedy: Remedy = {
    id: remedyData.id,
    name: remedyData.name,
    slug: remedyData.slug,
    icon: remedyData.icon || '💊',
    key_symptoms: remedyData.key_symptoms || [],
    description: remedyData.description || 'No description available.',
    average_rating: remedyData.average_rating || 0,
    review_count: remedyData.review_count || 0,
    rating: remedyData.average_rating || 0,
    reviewCount: remedyData.review_count || 0,
    indication: remedyData.indication || '',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relatedRemedies = (relatedRemediesData || []).map((ar: any) => {
    const remedy = ar.remedies;
    return {
      id: remedy.id,
      name: remedy.name,
      slug: remedy.slug,
      icon: remedy.icon || '💊',
      average_rating: remedy.average_rating || 0,
      review_count: remedy.review_count || 0,
      rating: remedy.average_rating || 0,
      reviewCount: remedy.review_count || 0,
      description: remedy.description || '',
      key_symptoms: remedy.key_symptoms || [],
      indication: remedy.indication || '',
    };
  });
  const review = await getReviewStats(remedy.id!, ailmentData.id || null);

  return { ailment, remedy, relatedRemedies, review };
}

export default async function AilmentRemedyPage({
  params,
}: {
  params: Promise<{ slug: string; remedySlug: string }>
}) {
  const { slug, remedySlug } = await params;
  const data = await getRemedyData(slug, remedySlug);

  
  if (!data) {
    notFound();
  }

  return (
    <RemediesDetail 
      remedy={data.remedy as Remedy & { id: string; slug: string }}
      relatedRemedies={data.relatedRemedies}
      review={data?.review?.data ?? undefined}
      ailmentContext={{
        id: data.ailment.id,
        name: data.ailment.name,
        slug: data.ailment.slug!
      }}
    />
  );
}