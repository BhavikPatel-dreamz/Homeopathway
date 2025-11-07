import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Ailment, Remedy } from "@/types";
import supabase from "@/lib/supabaseClient";
import { isMobileDevice } from "@/lib/userUtils";
import Image from "next/image";

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  // Auto-suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAilments, setFilteredAilments] = useState<Ailment[]>([]);
  const [filteredRemedies, setFilteredRemedies] = useState<Remedy[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  function nameToSlug(name: string) {
    return name.toLowerCase().replace(/ & /g, " and ").replace(/\s+/g, "-");
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        // On mobile, also collapse search if clicking outside
        if (isMobileDevice()) {
          setIsMobileSearchExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              .select("id, name, slug, icon, remedies_count")
              .ilike("name", `%${searchQuery}%`)
              .order("name", { ascending: true })
              .limit(5),
            supabase
              .from("remedies")
              .select("name, average_rating, review_count, description, icon")
              .ilike("name", `%${searchQuery}%`)
              .order("average_rating", { ascending: false })
              .limit(5),
          ]);

          if (ailmentsRes.error) throw ailmentsRes.error;
          if (remediesRes.error) throw remediesRes.error;

          setFilteredAilments(ailmentsRes.data || []);
          setFilteredRemedies((remediesRes.data || []).map(remedy => ({
            ...remedy,
            rating: remedy.average_rating,
            reviewCount: remedy.review_count,
            indication: "General" // Default value since indication field doesn't exist in DB
          })));
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
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    // Navigate to search results page with query
    const searchParams = new URLSearchParams({ q: searchQuery });
    router.push(`/search?${searchParams.toString()}`);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchExpanded(!isMobileSearchExpanded);
  };
  const handleSelectAilment = (ailment: Ailment) => {
    setSearchQuery(ailment.name);
    setShowSuggestions(false);
    // Use the slug from the database, fallback to generated slug if not available
    const slug = ailment.slug || nameToSlug(ailment.name);
    router.push(`/ailments/${slug}`);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setFilteredAilments([]);
    setFilteredRemedies([]);
    // On mobile, collapse search when clearing
    if (isMobileDevice()) {
      setIsMobileSearchExpanded(false);
    }
  };
  const handleSelectRemedy = (remedy: Remedy) => {
    setSearchQuery(remedy.name);
    setShowSuggestions(false);
    // Navigate to search with remedy name
    // const searchParams = new URLSearchParams({ q: remedy.name });
    // router.push(`/search?${searchParams.toString()}`);
    const slug = remedy.slug || nameToSlug(remedy.name);
    router.push(`/remedies/${slug}`);
  };

  return (
    <div className='w-full'>
      <div
        ref={searchRef}
        className='relative md:max-w-[400px] lg:max-w-[600px] 2xl:max-w-[870px] mx-auto'
      >
        {/* Mobile: Show icon or expanded search with overlay */}
        <div className='md:hidden flex justify-end'>
          {!isMobileSearchExpanded ? (
            // Mobile search icon
            <button
              onClick={toggleMobileSearch}
              className='flex items-center justify-center w-10 h-10 rounded-full  transition-shadow'
            >
              <Image
                width={24}
                height={24}
                src='/search.svg'
                className='w-6 h-6'
                alt='Search'
              />
            </button>
          ) : (
            // Mobile expanded search with full-screen overlay
            <div className='fixed inset-0 z-50 bg-black/30  pt-[30px] px-[16px] '>
              <div className=' w-full'>
                <div className='flex bg-white items-center gap-3 rounded-[8px]'>
                  <div className='relative flex-1'>
                    <Image
                      width={20}
                      height={20}
                      src='/search.svg'
                      className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10'
                      alt='Search'
                    />
                    <input
                      type='text'
                      placeholder="Search ailments or remedies..."
                      className='w-full pl-12 pr-4 py-3  rounded-[8px] text-[#0B0C0A] placeholder-[#41463B] focus:outline-none'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setIsMobileSearchExpanded(false)}
                    className='text-gray-600 hover:text-gray-800 transition-colors mr-3'
                  >
                    <svg
                      className='w-6 h-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>
                
                {/* Mobile Search Results */}
                {showSuggestions && (
                  <div className='max-h-[calc(100vh-100px)] overflow-y-auto bg-white border-t border-gray-100'>
                    {loading ? (
                      <div className='p-8 text-center text-gray-500'>
                        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E3E]'></div>
                        <p className='mt-2'>Searching...</p>
                      </div>
                    ) : (
                      <>
                        {/* Ailments Section */}
                        {filteredAilments.length > 0 && (
                          <div className='border-b border-gray-100'>
                            <div className='px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2'>
                              <span>😷</span> Ailments
                            </div>
                            {filteredAilments.map((ailment) => (
                              <button
                                key={ailment.id}
                                onClick={() => handleSelectAilment(ailment)}
                                className='w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group border-b border-gray-50 last:border-b-0'
                              >
                                <span className='text-2xl'>{ailment.icon}</span>
                                <div className='flex-1'>
                                  <div className='font-medium text-gray-900 group-hover:text-[#2C3E3E]'>
                                    {ailment.name}
                                  </div>
                                  <div className='text-sm text-gray-500'>
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
                            <div className='px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2'>
                              <span>💊</span> Remedies
                            </div>
                            {filteredRemedies.map((remedy, index) => (
                              <button
                                key={index}
                                onClick={() => handleSelectRemedy(remedy)}
                                className='w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group border-b border-gray-50 last:border-b-0'
                              >
                                <div className='w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl flex-shrink-0'>
                                  {remedy.icon}
                                </div>
                                <div className='flex-1'>
                                  <div className='font-medium text-gray-900 group-hover:text-[#2C3E3E]'>
                                    {remedy.name}
                                  </div>
                                  <div className='text-sm text-gray-500 truncate'>
                                    {remedy.description}
                                  </div>
                                </div>
                                <div className='text-sm text-yellow-600 font-medium flex items-center gap-1'>
                                  <span>⭐</span>
                                  {remedy.average_rating.toFixed(1)}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* No Results */}
                        {filteredAilments.length === 0 &&
                          filteredRemedies.length === 0 && (
                            <div className='p-8 text-center text-[#0B0C0A]'>
                              <p className='text-lg font-medium'>No results found</p>
                              <p className='text-sm mt-1'>
                                Try searching for different keywords
                              </p>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Always show full search */}
        <div className='hidden md:block'>
          <div className='relative'>
            <Image
              width={20}
              height={20}
              src='/search.svg'
              className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10'
              alt='Search'
            />
            <input
              type='text'
              placeholder="Search for ailments like 'headache' or 'anxiety' or search for remedies like 'arnica' or 'bella donna'"
              className='w-full pl-12 pr-12 py-3 lg:py-3 bg-white rounded-[8px] text-[#0B0C0A] placeholder-[#41463B] focus:outline-none'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => searchQuery && setShowSuggestions(true)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            )}
          </div>
          
          {/* Desktop Auto-Suggestions Dropdown */}
          {showSuggestions && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-20'>
              {loading ? (
                <div className='p-8 text-center text-gray-500'>
                  <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E3E]'></div>
                  <p className='mt-2'>Searching...</p>
                </div>
              ) : (
                <>
                  {/* Ailments Section */}
                  {filteredAilments.length > 0 && (
                    <div className='border-b border-gray-100'>
                      <div className='px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2'>
                        <span>😷</span> Ailments
                      </div>
                      {filteredAilments.map((ailment) => (
                        <button
                          key={ailment.id}
                          onClick={() => handleSelectAilment(ailment)}
                          className='w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group'
                        >
                          <span className='text-2xl'>{ailment.icon}</span>
                          <div className='flex-1'>
                            <div className='font-medium text-gray-900 group-hover:text-[#2C3E3E]'>
                              {ailment.name}
                            </div>
                            <div className='text-sm text-gray-500'>
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
                      <div className='px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2'>
                        <span>💊</span> Remedies
                      </div>
                      {filteredRemedies.map((remedy, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectRemedy(remedy)}
                          className='w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group'
                        >
                          <div className='w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl flex-shrink-0'>
                            {remedy.icon}
                          </div>
                          <div className='flex-1'>
                            <div className='font-medium text-gray-900 group-hover:text-[#2C3E3E]'>
                              {remedy.name}
                            </div>
                            <div className='text-sm text-gray-500 truncate'>
                              {remedy.description}
                            </div>
                          </div>
                          <div className='text-sm text-yellow-600 font-medium flex items-center gap-1'>
                            <span>⭐</span>
                            {remedy.average_rating.toFixed(1)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {filteredAilments.length === 0 &&
                    filteredRemedies.length === 0 && (
                      <div className='p-8 text-center text-[#0B0C0A]'>
                        <p className='text-lg font-medium'>No results found</p>
                        <p className='text-sm mt-1'>
                          Try searching for different keywords
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
