"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";

interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
}

interface Remedy {
  name: string;
  average_rating: number;
  review_count: number;
  description: string;
}

interface HomePageClientProps {
  initialAilments: Ailment[];
  initialTopRemedies: Remedy[];
}

export default function HomePageClient({
  initialAilments,
  initialTopRemedies,
}: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ailments, setAilments] = useState<Ailment[]>(initialAilments);
  const [topRemedies, setTopRemedies] =
    useState<Remedy[]>(initialTopRemedies);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAilments(initialAilments);
      setTopRemedies(initialTopRemedies);
      return;
    }

    setLoading(true);
    try {
      const [ailmentsRes, remediesRes] = await Promise.all([
        supabase
          .from("ailments")
          .select("id, name, icon, remedies_count")
          .ilike("name", `%${searchQuery}%`)
          .order("name", { ascending: true }),
        supabase
          .from("remedies")
          .select("name, average_rating, review_count, description")
          .ilike("name", `%${searchQuery}%`)
          .order("average_rating", { ascending: false })
          .order("review_count", { ascending: false })
          .limit(5),
      ]);

      if (ailmentsRes.error) throw ailmentsRes.error;
      if (remediesRes.error) throw remediesRes.error;

      setAilments(ailmentsRes.data || []);
      setTopRemedies(remediesRes.data || []);
    } catch (error) {
      console.error("Error during search:", error);
      // Optionally, set an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E3E]">
      <Header />

      {/* Hero Section */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-teal-700/80 to-gray-700/60 rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23456'/%3E%3C/svg%3E')",
              }}
            ></div>

            <div className="relative z-10 px-12 py-16 text-center text-white">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <path
                      d="M50 10 L50 50 M30 30 L50 50 L70 30 M20 50 L50 50 L80 50 M30 70 L50 50 L70 70"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="50" cy="50" r="3" fill="white" />
                    <circle cx="30" cy="30" r="2" fill="white" />
                    <circle cx="70" cy="30" r="2" fill="white" />
                    <circle cx="30" cy="70" r="2" fill="white" />
                    <circle cx="70" cy="70" r="2" fill="white" />
                  </svg>
                </div>
              </div>

              <h2 className="text-huge font-serif mb-3">Your Path to Healing</h2>
              <h1 className="text-huge">Huge heading</h1>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Find trusted homeopathic solutions for your health concerns,
                <br />
                backed by community reviews and expert guidance.
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for ailments like headache or anxiety, or search for remedies like arnica or belladonna"
                    className="w-full px-6 py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#2C3E3E] text-white rounded-full hover:bg-[#3C4E4E] transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Ailments Section */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">💊</span>
            <h3 className="text-3xl font-serif">
              {searchQuery.trim() ? "Ailment Results" : "Popular Ailments"}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ailments.slice(0, 17).map((ailment) => (
              <Link href={`/ailments/${ailment.id}`} key={ailment.id}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="text-3xl mb-2">{ailment.icon}</div>
                  <h4 className="font-medium text-sm mb-1">{ailment.name}</h4>
                  <p className="text-xs text-gray-500">
                    🔬 {ailment.remedies_count} remedies
                  </p>
                </div>
              </Link>
            ))}
            {!searchQuery.trim() && (
              <div className="bg-[#5A6A5A] text-white rounded-xl p-4 flex items-center justify-center hover:bg-[#4A5A4A] transition-colors cursor-pointer">
                <span className="font-medium">View all Ailments</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Rated Remedies Section */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">👍</span>
            <h3 className="text-3xl font-serif">
              {searchQuery.trim() ? "Remedy Results" : "Top Rated Remedies"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRemedies.map((remedy, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    💊
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{remedy.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {remedy.average_rating.toFixed(1)} ({remedy.review_count}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{remedy.description}</p>
              </div>
            ))}
            {!searchQuery.trim() && (
              <div className="bg-[#5A6A5A] text-white rounded-xl p-6 flex items-center justify-center hover:bg-[#4A5A4A] transition-colors cursor-pointer">
                <span className="font-medium text-lg">View all Remedies</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
