import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RemediesDetailPage from '../../../components/RemediesDetail';

interface RemedyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getRemedyBySlugOrId(slugOrId: string) {
  const supabase = await createClient();
  
  // First try to fetch by slug
  let { data: remedy, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('slug', slugOrId)
    .single();

  // If not found by slug, try by ID
  if (error && error.code === 'PGRST116') {
    const { data: remedyById, error: idError } = await supabase
      .from('remedies')
      .select('*')
      .eq('id', slugOrId)
      .single();
    
    remedy = remedyById;
    error = idError;
  }

  if (error || !remedy) {
    return null;
  }

  return remedy;
}

export async function generateMetadata({ params }: RemedyDetailPageProps) {
  const { id } = await params;
  const remedy = await getRemedyBySlugOrId(id);

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
  const { id } = await params;
  const remedy = await getRemedyBySlugOrId(id);

  if (!remedy) {
    notFound();
  }

  // For now, just render the component without passing the remedy
  // TODO: Update RemediesDetailPage to properly accept and use remedy prop
  return <RemediesDetailPage />;
}