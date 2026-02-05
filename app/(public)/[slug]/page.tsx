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

  const normalizedSlug = slugToMatch
  .trim()
  .toLowerCase();

const tryQueries = [
  // Exact
  { method: 'eq', value: normalizedSlug },

  // Case-insensitive
  { method: 'ilike', value: normalizedSlug },

  // Replace common special chars
  { method: 'ilike', value: normalizedSlug.replace(/&/g, 'and') },
  { method: 'ilike', value: normalizedSlug.replace(/\//g, '-') },
  { method: 'ilike', value: normalizedSlug.replace(/\s+/g, '-') },

  // Remove problematic characters
  { method: 'ilike', value: normalizedSlug.replace(/[()#'":]/g, '') },

  // Clean all except letters numbers dash
  { method: 'ilike', value: normalizedSlug.replace(/[^\w-]+/g, '') },

  // Wildcard safe search (IMPORTANT)
  { method: 'ilike', value: `%${normalizedSlug}%` },

  { method: 'ilike', value: `%${normalizedSlug.replace(/[^\w-]+/g, '')}%` },
];



  for (const q of tryQueries) {
  let res;

  if (q.method === 'eq') {
    res = await supabase
      .from('ailments')
      .select('*')
      .eq('slug', q.value)
      .limit(1);
  } else {
    res = await supabase
      .from('ailments')
      .select('*')
      .ilike('slug', q.value)
      .limit(1);
  }

  ailmentError = res.error;

  if (!ailmentError && res.data && res.data.length > 0) {
    ailmentData = res.data[0]; // ALWAYS single object
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
