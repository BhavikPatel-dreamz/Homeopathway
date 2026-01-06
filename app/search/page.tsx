import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import SearchResults from '@/components/SearchResults';
import { Metadata } from 'next';
import { Ailment, Remedy } from '@/types';

export const metadata: Metadata = {
  title: "Search Results - HomeoPathway",
  description: "Search results for homeopathic remedies and ailments",
};

async function SearchPageContent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

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
          .select("name, average_rating, review_count, description, icon")
          .ilike("name", `%${query}%`)
          .order("average_rating", { ascending: false })
          .order("review_count", { ascending: false })
          .limit(10),
      ]);

      if (!ailmentsRes.error) {
        ailments = ailmentsRes.data || [];
      }
      if (!remediesRes.error) {
        remedies = (remediesRes.data || []).map(remedy => ({
          ...remedy,
          rating: remedy.average_rating,
          reviewCount: remedy.review_count,
          indication: "General" // Default value since indication field doesn't exist in DB
        }));
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

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <div className="min-h-screen bg-[#F5F3ED]">
      <Suspense fallback={<div className="p-8 text-center">Loading search results...</div>}>
        <SearchPageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}