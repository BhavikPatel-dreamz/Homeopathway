import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchResults from '@/components/SearchResults';
import { Metadata } from 'next';
import { Ailment, Remedy } from '@/types';

export const metadata: Metadata = {
  title: "Search Results - Homeopathway",
  description: "Search results for homeopathic remedies and ailments",
};

async function SearchPageContent({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';
  const supabase = await createClient();

  let ailments: Ailment[] = [];
  let remedies: Remedy[] = [];

  if (query) {
    try {
      const [ailmentsRes, remediesRes] = await Promise.all([
        supabase
          .from("ailments")
          .select("id, name, slug, icon, remedies_count")
          .ilike("name", `%${query}%`)
          .order("name", { ascending: true }),
        supabase
          .from("remedies")
          .select("name, average_rating, review_count, description")
          .ilike("name", `%${query}%`)
          .order("average_rating", { ascending: false })
          .order("review_count", { ascending: false })
          .limit(10),
      ]);

      if (!ailmentsRes.error) {
        ailments = ailmentsRes.data || [];
      }
      if (!remediesRes.error) {
        remedies = remediesRes.data || [];
      }
    } catch (error) {
      console.error("Error during search:", error);
    }
  }

  return (
    <SearchResults 
      ailments={ailments}
      remedies={remedies}
      searchQuery={query}
    />
  );
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="min-h-screen bg-[#F5F3ED]">
      <Header />
      <Suspense fallback={<div className="p-8 text-center">Loading search results...</div>}>
        <SearchPageContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </div>
  );
}