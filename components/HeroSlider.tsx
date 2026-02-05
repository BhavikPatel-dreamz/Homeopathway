"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Ailment, Remedy } from "@/types";
import { checkIsUserLoggedIn } from "@/lib/userUtils";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import RequestAilmentRemedyModal from "./RequestAilmentRemedyModal";

// Custom Slider Component (LOOP ENABLED)
// Custom Slider Component (FULLY FIXED LOOP)
const CustomSlider = ({ slides }: { slides: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SWIPE_THRESHOLD = 50;

  // clone slides
  const extendedSlides = [
    slides[slides.length - 1],
    ...slides,
    slides[0],
  ];

  // autoplay
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // transition end handler (KEY FIX)
  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsAnimating(false);
      setCurrentIndex(slides.length);
    }

    if (currentIndex === slides.length + 1) {
      setIsAnimating(false);
      setCurrentIndex(1);
    }
  };

  // re-enable animation after silent jump
  useEffect(() => {
    if (!isAnimating) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    }
  }, [isAnimating]);

  // swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const deltaX = touchStartX.current - touchEndX.current;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      setCurrentIndex((prev) => (deltaX > 0 ? prev + 1 : prev - 1));
      pauseAutoPlay();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div
        className={`flex ${isAnimating ? "transition-transform duration-1000 ease-in-out" : ""
          }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, index) => (
          <div
            key={index}
            className="relative h-full
              [@media(min-width:330px)_and_(max-width:400px)]:min-h-[540px]
              [@media(min-width:300px)_and_(max-width:330px)]:min-h-[600px]
              min-h-[500px] sm:min-h-[460px] md:min-h-[500px]
              w-full flex-shrink-0"
          >
            <img
              src={slide}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dots (desktop only) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index + 1);
              pauseAutoPlay();
            }}
            className={`rounded-full transition-all duration-300 cursor-pointer  ${currentIndex === index + 1
              ? "bg-white w-10 h-2"
              : "bg-[#4B544A99] w-10 h-2"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function HeroSlider() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Auto-suggestion states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAilments, setFilteredAilments] = useState<Ailment[]>([]);
  const [filteredRemedies, setFilteredRemedies] = useState<Remedy[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const loggedIn = await checkIsUserLoggedIn();
      setIsLoggedIn(loggedIn);
    };
    checkUser();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
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
              .select("name, average_rating, review_count, description, icon, slug")
              .ilike("name", `%${searchQuery}%`)
              .order("average_rating", { ascending: false })
              .limit(5),
          ]);

          if (ailmentsRes.error) throw ailmentsRes.error;
          if (remediesRes.error) throw remediesRes.error;

          setFilteredAilments(ailmentsRes.data || []);
          setFilteredRemedies(
            (remediesRes.data || []).map((remedy) => ({
              ...remedy,
              rating: remedy.average_rating,
              reviewCount: remedy.review_count,
              indication: "General",
            }))
          );
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
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    setShowSuggestions(false);
    const searchParams = new URLSearchParams({ q: searchQuery });
    router.push(`/search?${searchParams.toString()}`);
  };

  const nameToSlug = (name: string) =>
    name.toLowerCase().replace(/ & /g, " and ").replace(/\s+/g, "-");

  const handleSelectAilment = (ailment: Ailment) => {
    setSearchQuery(ailment.name);
    setShowSuggestions(false);
    setFilteredAilments([]);
    setFilteredRemedies([]);
    const slug = ailment.slug || nameToSlug(ailment.name);
    router.push(`/${slug}`, { scroll: false });
  };

  const handleSelectRemedy = (remedy: Remedy) => {
    setSearchQuery(remedy.name);
    setShowSuggestions(false);
    const slug = remedy.slug || nameToSlug(remedy.name);
    router.push(`/remedies/${slug}`, { scroll: false });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setFilteredAilments([]);
    setFilteredRemedies([]);
  };

  useEffect(() => {
    if (showSuggestions) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuggestions]);

  const slides = [
    "/home-slide-1.png",
    "/home-slide-2.png",
    "/home-slide-3.png",
    "/home-slide-4.png",
    "/home-slide-5.png",
    "/home-slide-6.png",
  ];

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-between items-center relative">
        {/* Login/Avatar Button */}
        <div className="absolute top-4 right-3 z-20">
          {isLoggedIn ? (
            <UserAvatar className="w-11 h-11 text-base cursor-pointer" />
          ) : (
            <Link href="/login">
              <button className="text-montserrat px-4 py-[5px] border border-[#D3D6D1] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#D3D6D1] cursor-pointer transition-all duration-500 hover:text-white hover:bg-gray-400">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Custom Slider */}
      <CustomSlider slides={slides} />



      {/* Searchbar with Auto-Suggestions */}
      <div className="absolute bottom-[17px] lg:bottom-[75px] w-full left-1/2 -translate-x-1/2 z-10 pr-[15px] pl-[15px]">
        <div ref={searchRef} className="relative max-w-[930px] mx-auto">

          {/* Content */}
          <div className="relative  pb-0 md:pb-5">
            <div className="flex items-center flex-col lg:flex-row justify-center mb-6  max-w-[930px] mx-auto w-full bg-[#0000004D] md:p-4 p-2">
              <div className="w-35 h-35 md:w-40 md:h-40 lg:w-47.5 lg:h-47.5 mb-4 lg:mb-0 lg:mr-6 flex-shrink-0">
                <img
                  className="w-full h-full object-contain cursor-pointer"
                  src="/homeopathway-logo.svg"
                  alt="HomeoPathway Logo"
                />
              </div>
              <div className="text-white lg:text-left text-center">
                <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-[40px] mb-3 md:mb-4 leading-tight font-normal">
                  Your Path to Healing
                </h1>
                <h6 className="text-2xl sm:text-base md:text-lg lg:text-[24px] font-normal">
                  Find trusted homeopathic solutions for your health concerns, backed by
                  community reviews and expert guidance.
                </h6>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-[870px]">
            <img
              src="/search.svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10"
              alt="Search"
            />
            <input
              type="text"
              placeholder="Search for ailments like 'headache' or 'anxiety' or search for remedies like 'arnica' or 'belladonna'"
              className="w-full pl-12 pr-3 sm:pr-12 py-3 lg:py-6 bg-white rounded-[8px] text-[#0B0C0A] placeholder-[#41463B] focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => searchQuery && setShowSuggestions(true)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Auto-Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl border border-gray-100 z-20 max-w-[870px] mx-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E3E]"></div>
                  <p className="mt-2">Searching...</p>
                </div>
              ) : (
                <>
                  <div className="search-menu-scrollbar lg:max-h-96 max-h-60 overflow-y-auto">
                    {/* Ailments Section */}
                    {filteredAilments.length > 0 && (
                      <div className="aliments-menu">
                        {/* <div className="px-4 py-2 text-xs font-semibold text-[#0B0C0A] uppercase tracking-wide flex items-center gap-2">
                          <img
                            className="w-[20px] h-[20px] lg:w-[30px] lg:h-[30px]"
                            src="/ailments-icon.svg"
                            alt=""
                          />{" "}
                          Ailments
                        </div> */}
                        {filteredAilments.map((ailment) => (
                          <button
                            key={ailment.id}
                            onClick={() => handleSelectAilment(ailment)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                          >
                            <span className="text-2xl">{ailment.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium sm:text-xl text-base text-[#2C3E3E] group-hover:text-[#0B0C0A]">
                                {ailment.name}
                              </div>
                              {/* <div className="text-sm text-gray-500 hover:text-gray-700">
                                🔬 {ailment.remedies_count} remedies available
                              </div> */}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Remedies Section */}
                    {filteredRemedies.length > 0 && (
                      <div className="remedies-menu">
                        {/* <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                          <img
                            className="w-[20px] h-[20px] lg:w-[30px] lg:h-[30px]"
                            src="/top-remedies.svg"
                            alt="Top Remedies Icon"
                          />{" "}
                          Remedies
                        </div> */}
                        {filteredRemedies.map((remedy, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectRemedy(remedy)}
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#F9F7F2] flex items-center justify-center text-xl flex-shrink-0">
                              {remedy.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium sm:text-xl text-base text-[#2C3E3E] group-hover:text-[#0B0C0A]">
                                {remedy.name}
                              </div>
                              {/* <div className="text-sm text-gray-500 hover:text-gray-700 break-words whitespace-pre-wrap line-clamp-3">
                                {remedy.description}
                              </div> */}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {filteredAilments.length === 0 &&
                      filteredRemedies.length === 0 && (
                        <div className="no-results-menu p-8 text-center text-[#0B0C0A]">
                          <p className="text-lg font-medium">No results found</p>
                          <p className="text-sm mt-1">
                            Try searching for different keywords
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Request Button Section */}
                  <div className="request-button-section px-4 py-4 flex flex-wrap items-center justify-flex-start gap-3 position-sticky bottom-0">
                    <p className="text-[#41463B] font-medium text-sm whitespace-nowrap">
                      Can&apos;t find what you&apos;re looking for?
                    </p>
                    <button
                      onClick={() => {
                        setShowRequestModal(true);
                        setShowSuggestions(false);
                      }}
                      className="px-2 py-1 ml-2 bg-white hover:bg-[#4a5f56] text-[#2B2E28] hover:text-white border border-black rounded-full font-semibold text-sm transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      Request a new ailment or remedy
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <RequestAilmentRemedyModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </section>
  );
}
