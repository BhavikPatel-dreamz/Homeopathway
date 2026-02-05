/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import RemediesDetail from '@/components/RemediesDetail';
import { getReviewStats } from '@/lib/review';
import { Remedy, Ailment } from '@/types';




async function getRemedyData(ailmentSlug: string, remedySlug: string) {
  // First, get the ailment to verify it exists

  const decodedAilmentSlug = decodeURIComponent(ailmentSlug).trim();
  const decodedRemedySlug = decodeURIComponent(remedySlug || '').trim();

  const { data: ailmentRows, error: ailmentError } = await supabase
    .from('ailments')
    .select('id, name, slug, icon')
    .eq('slug', decodedAilmentSlug)
    .limit(1);

  let ailmentData = ailmentRows?.[0];
  let usedCombinedAilmentSlug = false;

  // Fallback: if the ailment slug contains an encoded '/' it may have been split
  // into two route params (e.g. 'eczema-/-dermatitis' -> 'eczema-' and '-dermatitis').
  // Try combined slug lookup before failing.
  if (!ailmentData && !ailmentError && decodedRemedySlug) {
    const attempts: { type: string; slug: string }[] = [];
    const combinedSlash = `${decodedAilmentSlug}/${decodedRemedySlug}`;
    const combinedNoSlash = `${decodedAilmentSlug}${decodedRemedySlug}`;
    const combinedHyphen = `${decodedAilmentSlug.replace(/-$/, '')}-${decodedRemedySlug.replace(/^-/, '')}`;
    const wildcard = `%${decodedAilmentSlug}%${decodedRemedySlug}%`;

    attempts.push({ type: 'combinedSlash', slug: combinedSlash });
    attempts.push({ type: 'combinedNoSlash', slug: combinedNoSlash });
    attempts.push({ type: 'combinedHyphen', slug: combinedHyphen });
    attempts.push({ type: 'wildcard', slug: wildcard });

    for (const attempt of attempts) {
      try {
        let res;
        if (attempt.type === 'wildcard') {
          res = await supabase
            .from('ailments')
            .select('id, name, slug, icon')
            .ilike('slug', attempt.slug)
            .limit(1);
        } else {
          res = await supabase
            .from('ailments')
            .select('id, name, slug, icon')
            .eq('slug', attempt.slug)
            .limit(1);
        }

        const { data: attemptRows, error: attemptError } = res as any;
        if (attemptError) {
          console.error('Error fetching ailment (fallback)', { attempt: attempt.type, slug: attempt.slug, error: attemptError.message });
          continue;
        }
        if (attemptRows && attemptRows.length > 0) {
          ailmentData = attemptRows[0];
          usedCombinedAilmentSlug = true;
          console.debug('Found ailment via fallback', { attempt: attempt.type, slug: attempt.slug });
          break;
        } else {
          console.debug('No ailment found for fallback', { attempt: attempt.type, slug: attempt.slug });
        }
      } catch (e) {
        console.error('Unexpected error during fallback lookup', { attempt: attempt.type, slug: attempt.slug, error: e });
      }
    }
  }

  if (ailmentError || !ailmentData) {
    console.error('Error fetching ailment', {
      slug: decodedAilmentSlug,
      triedCombinedWith: decodedRemedySlug || null,
      error: ailmentError?.message ?? null,
      rows: ailmentRows?.length ?? 0,
    });
    return null;
  }

  // Then get the remedy and verify it's associated with this ailment

const { data: remedyRows, error: remedyError } = await supabase
  .from('remedies')
  .select('*')
  .eq('slug', decodedRemedySlug)
  .limit(1);

let remedyData = remedyRows?.[0];



  if (remedyError || !remedyData) {
    console.error('Error fetching remedy', {
      slug: decodedRemedySlug,
      error: remedyError?.message ?? null,
      rows: remedyRows?.length ?? 0,
    });

    // Fallback attempts: remedySlug may actually be a fragment of the ailment slug
    // (e.g. '-dermatitis') — try cleaned, wildcard, and ailment-scoped lookups.
    const cleanedRemedy = decodedRemedySlug.replace(/(^-+|-+$)/g, '').trim();
    const attempts: { type: string; slug: string }[] = [];
    if (cleanedRemedy && cleanedRemedy !== decodedRemedySlug) {
      attempts.push({ type: 'cleaned', slug: cleanedRemedy });
    }
    if (cleanedRemedy) {
      attempts.push({ type: 'wildcard', slug: `%${cleanedRemedy}%` });
      attempts.push({ type: 'ailmentScoped', slug: `${ailmentData.slug}/${cleanedRemedy}` });
    }

    for (const attempt of attempts) {
      try {
        let res;
        if (attempt.type === 'wildcard') {
          res = await supabase
            .from('remedies')
            .select('*')
            .ilike('slug', attempt.slug)
            .limit(1);
        } else {
          res = await supabase
            .from('remedies')
            .select('*')
            .eq('slug', attempt.slug)
            .limit(1);
        }
        const { data: attemptRows, error: attemptError } = res as any;
        if (attemptError) {
          console.error('Error fetching remedy (fallback)', { attempt: attempt.type, slug: attempt.slug, error: attemptError.message });
          continue;
        }
        if (attemptRows && attemptRows.length > 0) {
          remedyData = attemptRows[0];
          console.debug('Found remedy via fallback', { attempt: attempt.type, slug: attempt.slug });
          break;
        } else {
          console.debug('No remedy found for fallback', { attempt: attempt.type, slug: attempt.slug });
        }
      } catch (e) {
        console.error('Unexpected error during remedy fallback lookup', { attempt: attempt.type, slug: attempt.slug, error: e });
      }
    }

    if (!remedyData) {
      // If we found the ailment by combining the two route segments, it's likely
      // the request was meant for the ailment page rather than a remedy. Signal
      // this to the page so it can redirect to the ailment URL.
      if (usedCombinedAilmentSlug) {
        return { ailment: { id: ailmentData.id, name: ailmentData.name, slug: ailmentData.slug, icon: ailmentData.icon || '🩺' } as Ailment, remedy: null, relatedRemedies: [], review: null, usedCombinedAilmentSlug };
      }
      return null;
    }
  }

  // Check if this remedy is associated with this ailment
  const { data: associationData, error: associationError } = await supabase
    .from('ailment_remedies')
.select('*')
.eq('ailment_id', ailmentData.id)
.eq('remedy_id', remedyData.id)
.limit(1);


  if (associationError || !associationData || associationData.length === 0) {
    console.error('Remedy not associated with this ailment', {
      ailmentId: ailmentData?.id,
      remedyId: remedyData?.id,
      associationError: associationError?.message ?? null,
    });
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

  // If getRemedyData found that the slug combination actually matched an
  // ailment (and no remedy was found), redirect to the ailment page so the
  // user sees the intended content instead of a 404.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - `usedCombinedAilmentSlug` may be present on the returned object
  if (data && (data as any).usedCombinedAilmentSlug && !data.remedy) {
    const ailmentSlug = encodeURIComponent(data.ailment.slug || '');
    redirect(`/${ailmentSlug}`);
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