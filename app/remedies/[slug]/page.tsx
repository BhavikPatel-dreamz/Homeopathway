import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RemediesDetailPage from '../../../components/RemediesDetail';

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
  console.log(remedy,"12121")
  // If not found by slug, try by ID
  // if (error && error.code === 'PGRST116') {
  //   const { data: remedyById, error: idError } = await supabase
  //     .from('remedies')
  //     .select('*')
  //     .eq('id', slugOrId)
  //     .single();
    
  //   remedy = remedyById;
  //   error = idError;
  // }

  if (error || !remedy) {
    return null;
  }

  return remedy;
}

export async function generateMetadata({ params }: RemedyDetailPageProps) {
  const {slug} = await params;
  const remedy = await getRemedyBySlugOrId(slug);
  console.log(remedy,"12121228888")

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
  console.log(slug,"11111")
  const remedy = await getRemedyBySlugOrId(slug);
  console.log(remedy,"4444")
  if (!remedy) {
    notFound();
  }

  // For now, just render the component without passing the remedy
  // TODO: Update RemediesDetailPage to properly accept and use remedy prop
  return <RemediesDetailPage params={{slug}} />;
}