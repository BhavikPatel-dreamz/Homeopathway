/* eslint-disable @typescript-eslint/no-explicit-any */

import { notFound } from 'next/navigation';
import AilmentDetailPage from '../../../components/AilmentDetailPage';
import { supabase } from '@/lib/supabaseClient';

interface Remedy {
  id: string;
  name: string;
  indication: string;
  rating: number;
  slug:string
  reviewCount: number;
  description: string;
  key_symptoms?: string[];
  icon:string
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
  // Normalize slug and attempt multiple safe matches to handle encoding/special chars
  const slugToMatch = decodeURIComponent(String(slug)).trim();

  // Try exact match first
  let ailmentData: any = null;
  let ailmentError: any = null;

  const tryQueries = [
    { method: 'eq', value: slugToMatch },
    { method: 'ilike', value: slugToMatch },
    { method: 'ilike', value: slugToMatch.replace(/&/g, 'and') },
  ];

  for (const q of tryQueries) {
    if (q.method === 'eq') {
      ({ data: ailmentData, error: ailmentError } = await supabase
        .from('ailments')
        .select('*')
        .eq('slug', q.value));
    } else if (q.method === 'ilike') {
      ({ data: ailmentData, error: ailmentError } = await supabase
        .from('ailments')
        .select('*')
        .ilike('slug', q.value));
    }

    const ailmentRecordCandidate = Array.isArray(ailmentData) ? (ailmentData[0] || null) : ailmentData;
    if (!ailmentError && ailmentRecordCandidate) {
      ailmentData = ailmentData;
      ailmentError = null;
      // use the candidate
      ailmentData = ailmentRecordCandidate;
      break;
    }
  }

  const ailmentRecord = ailmentData;
  if (ailmentError || !ailmentRecord) {
    console.error('Error fetching ailment for slug:', slugToMatch, 'error:', ailmentError?.message);
    return null;
  }


  

  const { data: remediesData, error: remediesError } = await supabase
    .from('ailment_remedies')
    .select(`
      remedy_id,
      remedies:remedy_id (
        id,
        name,
        description,
        slug,
        key_symptoms,
        average_rating,
        review_count,
        icon
      )
    `)
    .eq('ailment_id', ailmentRecord.id);

  if (remediesError) {
    console.error('Error fetching remedies:', remediesError.message);
  }

  const ailment: Ailment = {
    id: ailmentRecord.id,
    name: ailmentRecord.name,
    slug: ailmentRecord.slug,
    icon: ailmentRecord.icon || '🩺',
    remedies_count: ailmentRecord.remedies_count || 0,
    description: ailmentRecord.description || 'No description available.',
    personalized_approach: ailmentRecord.personalized_approach || 'The beauty of homeopathic treatment lies in its individualized approach. Two people with the same condition may receive different remedies based on their unique symptoms.',
  };

  const remedies: Remedy[] = (remediesData || []).map((ar: unknown) => {
    const ailmentRemedy = ar as Record<string, unknown>;
    const remedy = ailmentRemedy.remedies as Record<string, unknown>;
    return {
      id: (remedy.id as string),
      name: remedy.name as string,
      indication: (remedy.key_symptoms as string[])?.[0] || 'No indication specified.',
      rating: (remedy.average_rating as number) || 0,
      slug:remedy.slug as string,
      reviewCount: (remedy.review_count as number) || 0,
      description: (remedy.description as string) || 'No description available.',
      key_symptoms: (remedy.key_symptoms as string[]) || [],
     icon: (remedy.icon as string)
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
