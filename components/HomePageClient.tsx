"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// @ts-ignore
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
  const [topRemedies, setTopRemedies] = useState<Remedy[]>(initialTopRemedies);
  const [loading, setLoading] = useState(false);
  
  // Auto-suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAilments, setFilteredAilments] = useState<Ailment[]>([]);
  const [filteredRemedies, setFilteredRemedies] = useState<Remedy[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-search as user types (debounced)
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setLoading(true);
        setShowSuggestions(true);
        
        try {
          const [ailmentsRes, remediesRes] = await Promise.all([
            supabase
              .from("ailments")
              .select("id, name, icon, remedies_count")
              .ilike("name", `%${searchQuery}%`)
              .order("name", { ascending: true })
              .limit(5),
            supabase
              .from("remedies")
              .select("name, average_rating, review_count, description")
              .ilike("name", `%${searchQuery}%`)
              .order("average_rating", { ascending: false })
              .limit(5),
          ]);

          if (ailmentsRes.error) throw ailmentsRes.error;
          if (remediesRes.error) throw remediesRes.error;

          setFilteredAilments(ailmentsRes.data || []);
          setFilteredRemedies(remediesRes.data || []);
        } catch (error) {
          console.error("Error during search:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setShowSuggestions(false);
        setFilteredAilments([]);
        setFilteredRemedies([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAilments(initialAilments);
      setTopRemedies(initialTopRemedies);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAilment = (ailment: Ailment) => {
    setSearchQuery(ailment.name);
    setShowSuggestions(false);
    // Navigate to ailment page
    window.location.href = `/ailments/${ailment.id}`;
  };

  const handleSelectRemedy = (remedy: Remedy) => {
    setSearchQuery(remedy.name);
    setShowSuggestions(false);
    handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setFilteredAilments([]);
    setFilteredRemedies([]);
    setAilments(initialAilments);
    setTopRemedies(initialTopRemedies);
  };

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1200, 
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, 
    autoplaySpeed: 3000,
    fade: true,
    cssEase: "ease-in-out", 
  };
  
  return (
    <div className="min-h-screen bg-[#2C3E3E]">
      <Header />

      <div>
        <section className="relative">
          <Slider {...settings} className="relative home-slider">
            {/*------ Slide 1 -----*/}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full">
                <img className="object-cover h-full w-full" src="/home-slide-1.png" alt="" />
              </div>
              <div className="relative flex pt-25 pb-30 lg:pb-48 pl-[15px] pr-[15px]">
                <div className="flex items-center flex-col lg:flex-row justify-center mb-6 max-w-[900px] mx-auto">
                  <div className="w-35 h-35 md:w-48 md:h-48 lg:w-48 lg:h-48 mr-6 flex-shrink-0 lg:mb-0 mb-2">
                    <img className="w-full h-full object-contain" src="/home-banner-logo.svg" alt="" />
                  </div>
                  <div className="text-white lg:text-left text-center">
                    <h1 className="text-[32px] md:text-[32px] lg:text-[40px]">Your Path to Healing</h1>
                    <h6 className="text-[24px] font-[400]">
                      Find trusted homeopathic solutions for your health concerns, backed by community reviews and expert guidance.
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            {/*------ Slide 2 -----*/}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full">
                <img className="object-cover h-full w-full" src="/home-slide-2.png" alt="" />
              </div>
              <div className="relative flex pt-25 pb-30 lg:pb-48 pl-[15px] pr-[15px]">
                <div className="flex items-center flex-col lg:flex-row justify-center mb-6 max-w-[900px] mx-auto">
                  <div className="w-35 h-35 md:w-48 md:h-48 lg:w-48 lg:h-48 mr-6 flex-shrink-0 lg:mb-0 mb-2">
                    <img className="w-full h-full object-contain" src="/home-banner-logo.svg" alt="" />
                  </div>
                  <div className="text-white lg:text-left text-center">
                    <h1 className="text-[32px] md:text-[32px] lg:text-[40px]">Your Path to Healing</h1>
                    <h6 className="text-[24px] font-[400]">
                      Find trusted homeopathic solutions for your health concerns, backed by community reviews and expert guidance.
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            {/*------ Slide 3 -----*/}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full">
                <img className="object-cover h-full w-full" src="/home-slide-3.png" alt="" />
              </div>
              <div className="relative flex pt-25 pb-30 lg:pb-48 pl-[15px] pr-[15px]">
                <div className="flex items-center flex-col lg:flex-row justify-center mb-6 max-w-[900px] mx-auto">
                  <div className="w-35 h-35 md:w-48 md:h-48 lg:w-48 lg:h-48 mr-6 flex-shrink-0 lg:mb-0 mb-2">
                    <img className="w-full h-full object-contain" src="/home-banner-logo.svg" alt="" />
                  </div>
                  <div className="text-white lg:text-left text-center">
                    <h1 className="text-[32px] md:text-[32px] lg:text-[40px]">Your Path to Healing</h1>
                    <h6 className="text-[24px] font-[400]">
                      Find trusted homeopathic solutions for your health concerns, backed by community reviews and expert guidance.
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            {/*------ Slide 4 -----*/}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full">
                <img className="object-cover h-full w-full" src="/home-slide-1.png" alt="" />
              </div>
              <div className="relative flex pt-25 pb-30 lg:pb-48 pl-[15px] pr-[15px]">
                <div className="flex items-center flex-col lg:flex-row justify-center mb-6 max-w-[900px] mx-auto">
                  <div className="w-35 h-35 md:w-48 md:h-48 lg:w-48 lg:h-48 mr-6 flex-shrink-0 lg:mb-0 mb-2">
                    <img className="w-full h-full object-contain" src="/home-banner-logo.svg" alt="" />
                  </div>
                  <div className="text-white lg:text-left text-center">
                    <h1 className="text-[32px] md:text-[32px] lg:text-[40px]">Your Path to Healing</h1>
                    <h6 className="text-[24px] font-[400]">
                      Find trusted homeopathic solutions for your health concerns, backed by community reviews and expert guidance.
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            {/*------ Slide 5 -----*/}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full">
                <img className="object-cover h-full w-full" src="/home-slide-1.png" alt="" />
              </div>
              <div className="relative flex pt-25 pb-30 lg:pb-48 pl-[15px] pr-[15px]">
                <div className="flex items-center flex-col lg:flex-row justify-center mb-6 max-w-[900px] mx-auto">
                  <div className="w-35 h-35 md:w-48 md:h-48 lg:w-48 lg:h-48 mr-6 flex-shrink-0 lg:mb-0 mb-2">
                    <img className="w-full h-full object-contain" src="/home-banner-logo.svg" alt="" />
                  </div>
                  <div className="text-white lg:text-left text-center">
                    <h1 className="text-[32px] md:text-[32px] lg:text-[40px]">Your Path to Healing</h1>
                    <h6 className="text-[24px] font-[400]">
                      Find trusted homeopathic solutions for your health concerns, backed by community reviews and expert guidance.
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            {/*------ Slide 6 -----*/}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full">
                <img className="object-cover h-full w-full" src="/home-slide-1.png" alt="" />
              </div>
              <div className="relative flex pt-25 pb-30 lg:pb-48 pl-[15px] pr-[15px]">
                <div className="flex items-center flex-col lg:flex-row justify-center mb-6 max-w-[900px] mx-auto">
                  <div className="w-35 h-35 md:w-48 md:h-48 lg:w-48 lg:h-48 mr-6 flex-shrink-0 lg:mb-0 mb-2">
                    <img className="w-full h-full object-contain" src="/home-banner-logo.svg" alt="" />
                  </div>
                  <div className="text-white lg:text-left text-center">
                    <h1 className="text-[32px] md:text-[32px] lg:text-[40px]">Your Path to Healing</h1>
                    <h6 className="text-[24px] font-[400]">
                      Find trusted homeopathic solutions for your health concerns, backed by community reviews and expert guidance.
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </Slider>

          {/*------ Searchbar with Auto-Suggestions -----*/}
          <div className="absolute bottom-[60px] lg:bottom-[100px] w-full left-1/2 -translate-x-1/2 z-10 pr-[15px] pl-[15px]">
            <div ref={searchRef} className="relative max-w-[870px] mx-auto">
              <div className="relative">
                <img 
                  src="/search.svg" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10"
                  alt="Search"
                />
                <input
                  type="text"
                  placeholder="Search for ailments like 'headache' or 'anxiety' or search for remedies like 'arnica' or 'bella donna'"
                  className="w-full pl-12 pr-12 py-3 lg:py-6 bg-white rounded-[8px] text-gray-800 placeholder-gray-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Auto-Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-20">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E3E]"></div>
                      <p className="mt-2">Searching...</p>
                    </div>
                  ) : (
                    <>
                      {/* Ailments Section */}
                      {filteredAilments.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                            <span>😷</span> Ailments
                          </div>
                          {filteredAilments.map((ailment) => (
                            <button
                              key={ailment.id}
                              onClick={() => handleSelectAilment(ailment)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                            >
                              <span className="text-2xl">{ailment.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 group-hover:text-[#2C3E3E]">
                                  {ailment.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  🔬 {ailment.remedies_count} remedies available
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Remedies Section */}
                      {filteredRemedies.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                            <span>💊</span> Remedies
                          </div>
                          {filteredRemedies.map((remedy, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectRemedy(remedy)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                            >
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl flex-shrink-0">
                                💊
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 group-hover:text-[#2C3E3E]">
                                  {remedy.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {remedy.description}
                                </div>
                              </div>
                              <div className="text-sm text-yellow-600 font-medium flex items-center gap-1">
                                <span>⭐</span>
                                {remedy.average_rating.toFixed(1)}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {filteredAilments.length === 0 && filteredRemedies.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <p className="text-lg font-medium">No results found</p>
                          <p className="text-sm mt-1">Try searching for different keywords</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Popular Ailments Section */}
      <section className="px-6 py-12 bg-[#f5f3ed]">
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
      <Footer />
    </div>
  );
}