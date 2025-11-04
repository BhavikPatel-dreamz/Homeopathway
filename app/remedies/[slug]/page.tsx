import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RemediesDetailPage from '../../../components/RemediesDetail';
import { Remedy } from '@/types';

interface RemedyDetailPageProps {
  params: Promise<{
     slug: string;
  }>;
}

async function getRemedyBySlugOrId(slug: string) {
  const supabase = await createClient();
  
  // First try to fetch by slug
  let { data: remedy, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('slug', slug)
    .single();


  if (error || !remedy) {
    return null;
  }

  return remedy;
}

async function getRelatedRemedies(): Promise<Remedy[]> {
  const supabase = await createClient();

  // Fetch the details of the related remedies
  const { data: remedies, error: remediesError } = await supabase
    .from('remedies')
    .select('*')
    .limit(4); // Fetch 4 to filter out the current one and show 3

  return remedies || [];
}

export async function generateMetadata({ params }: RemedyDetailPageProps) {
  const {slug} = await params;
  const remedy = await getRemedyBySlugOrId(slug);

  if (!remedy) {
    return {
      title: 'Remedy Not Found',
    };
  }

  return {
    title: `${remedy.name} - Homeopathic Remedy Details`,
    description: remedy.description || `Learn about ${remedy.name}, a homeopathic remedy with detailed information about its uses, symptoms, and dosage.`,
    openGraph: {
      title: `${remedy.name} - Homeopathic Remedy`,
      description: remedy.description || `Detailed information about ${remedy.name} homeopathic remedy.`,
      type: 'article',
    },
  };
}

export default async function RemedyDetailPage({ params }: RemedyDetailPageProps) {
  const { slug } = await params;
  const remedy = await getRemedyBySlugOrId(slug);

  if (!remedy) {
    notFound();
  }

  const relatedRemedies = await getRelatedRemedies();

  return <RemediesDetailPage remedy={remedy} relatedRemedies={relatedRemedies} />;
}