/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Loader2, ChevronDown, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import supabase from '@/lib/supabaseClient';
import {
  getReviews,
  getReviewFilterOptions,
  getReviewStats,
} from "@/lib/review";
import { getCurrentUser } from "@/lib/auth";
import { useAuth } from '@/lib/authContext';
import ReviewFilterModal from "./ReviewFilterModal";
import { ReviewFilters } from "@/types";
import AddReviewForm from "./AddReviewForm";
import { Remedy, Review as ReviewType } from "@/types";

// ---------------------------
// Type Definitions
// ---------------------------

interface ReviewListPageProps {
  remedy: Remedy & {
    id: string;
    name: string;
    scientific_name?: string;
    common_name?: string;
    constitutional_type?: string;
    dosage_forms?: string[];
    safety_precautions?: string;
  };
  ailmentContext?: {
    id: string;
    name: string;
    slug: string;
  };
}

// ---------------------------
// Utility Functions
// ---------------------------
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "min"],
  ];

  for (const [secondsInUnit, label] of intervals) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval > 1) return `${interval} ${label}s ago`;
    if (interval === 1) return `1 ${label} ago`;
  }

  return "Just now";
};

/**
 * Splits strings like "Pellet 6C" into ["Pellet", "6C"]
 * while keeping "Once daily" as a single tag.
 */
const processUsageTags = (tags: (string | null | undefined)[]) => {
  const processed: string[] = [];

  tags.forEach((tag) => {
    if (!tag) return;

    const parts = tag.split(/\s+/);
    const potencyRegex = /^\d+(C|X|CK|LM)$/i;
    const isPelletOrPotency = parts.some(p => p.toLowerCase() === "pellet" || potencyRegex.test(p));

    if (isPelletOrPotency && parts.length > 1) {
      processed.push(...parts);
    } else {
      processed.push(tag);
    }
  });

  return Array.from(new Set(processed));
};

// ---------------------------
// Star Renderer
// ---------------------------
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex text-yellow-400 gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Image
          key={`full-${i}`}
          src="/star.svg"
          alt="Star"
          width={16}
          height={16}
        />
      ))}
      {hasHalfStar && (
        <Image
          key="half"
          src="/star-half-fill.svg"
          alt="Half Star"
          width={16}
          height={16}
        />
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <Image
          key={`empty-${i}`}
          src="/star-line.svg"
          alt="Empty Star"
          width={16}
          height={16}
        />
      ))}
    </div>
  );
};
type SortBy = "newest" | "oldest" | "highest_rated" | "lowest_rated";

// ---------------------------
// Main Component
// ---------------------------
export default function ReviewListPage({
  remedy,
  ailmentContext,
}: ReviewListPageProps) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // States
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  } | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    potencies: string[];
    forms: string[];
  }>({
    potencies: [],
    forms: [],
  });

  const [filters, setFilters] = useState<ReviewFilters>({
    rating: [],
    dosage: [],
    form: [],
    dateRange: "all",
    userName: "",
  });

  const [activeFilters, setActiveFilters] = useState<{
    dosage: string[];
    dateRange: string;
    form: string[];
    userName: string;
  }>({
    dosage: [],
    dateRange: "all",
    form: [],
    userName: "",
  });


  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(3);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [allReviesList, setAllReviewsList] = useState<ReviewType[]>([]);

  const [ailmentMap, setAilmentMap] = useState<Record<string, { name: string; icon?: string }>>({});
  const { user } = useAuth();

  // Fetch ailment names/icons for any ailment ids present in fetched reviews
  useEffect(() => {
    const idsToFetch = new Set<string>();
    (allReviesList || []).forEach((review: any) => {
      const aid = review?.ailment_id ?? (typeof review?.ailment === 'string' ? review.ailment : review?.ailment?.id);
      if (aid && !ailmentMap[aid]) idsToFetch.add(String(aid));
    });

    const ids = Array.from(idsToFetch);
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('ailments')
          .select('id, name, icon')
          .in('id', ids);
        if (error) {
          console.error('Error fetching ailments:', error);
          return;
        }
        if (cancelled) return;
        setAilmentMap(prev => {
          const copy = { ...prev };
          (data || []).forEach((a: any) => {
            if (a?.id && (a?.name || a?.icon)) copy[a.id] = { name: a.name || '', icon: a.icon || '' };
          });
          return copy;
        });
      } catch (err) {
        console.error('Error fetching ailments:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [allReviesList, ailmentMap]);


  // ---------------------------
  // Fetch Reviews + Stats
  // ---------------------------
  const fetchReviews = async (isPagination = false) => {
    if (!remedy.id) return;
    if (isPagination) setIsPageLoading(true);
    else setIsInitialLoading(true);

    try {
      const { data: reviewsData } = await getReviews({
        remedyId: remedy.id,
        ailmentId: ailmentContext?.id,
        limit: Math.max(reviewsPerPage * 3, 50),
        sortBy,
        starCount: filters.rating,
        searchQuery,
        potency: filters.dosage,
        dosage: filters.form
      });
      console.log("Fetched reviews:", reviewsData);

      // If ailment-scoped fetch returned no reviews, fall back to fetching
      // all reviews for the remedy (preserves strict AND logic but avoids
      // showing an empty list when there are general reviews for the remedy).
      let allReviews = reviewsData || [];
      if ((allReviews.length === 0) && (ailmentContext?.id !== undefined && ailmentContext?.id !== null)) {
        try {
          const { data: fallback } = await getReviews({
            remedyId: remedy.id,
            // no ailmentId -> fetch all reviews for the remedy
            limit: Math.max(reviewsPerPage * 3, 50),
            sortBy,
            starCount: filters.rating,
            searchQuery,
            potency: filters.dosage,
            dosage: filters.form,
          });
          console.log("Fallback fetched reviews (no ailment filter):", fallback);
          allReviews = fallback || [];
          setAllReviewsList(fallback || []);
        } catch (err) {
          console.error('Fallback fetch failed:', err);
        }
      } else {
        setAllReviewsList(reviewsData ?? []);
      }
      setAllReviewsList(reviewsData ?? []);

      // Build a simple ailment map from incoming reviews to resolve ids->names/icons
      const aMap: Record<string, { name: string; icon?: string }> = {};
      (reviewsData || []).forEach((rev: any) => {
        const aObj = rev?.ailment && typeof rev.ailment === 'object' ? rev.ailment : undefined;
        const aid = rev?.ailment_id ?? (typeof rev?.ailment === 'string' ? rev.ailment : aObj?.id);
        const name = aObj?.name || rev?.ailment_name || rev?.ailmentName || aObj?.label || '';
        const icon = aObj?.icon || rev?.ailment_icon || rev?.ailmentIcon || aObj?.emoji || '';
        if (aid && (name || icon)) {
          aMap[String(aid)] = { name: name || '', icon: icon || '' };
        }
      });
      setAilmentMap((prev) => ({ ...aMap, ...prev }));

      allReviews = allReviews.filter((review) => {
        if (activeFilters.dosage.length > 0) {
          const hasMatchingTag = activeFilters.dosage.some(
            (tag) => review.dosage === tag || review.potency === tag
          );
          if (!hasMatchingTag) return false;
        }

        if (activeFilters.dateRange !== "all") {
          const reviewDate = new Date(review.created_at);
          const now = new Date();
          const daysDiff = Math.floor(
            (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          switch (activeFilters.dateRange) {
            case "today": if (daysDiff > 0) return false; break;
            case "week": if (daysDiff > 7) return false; break;
            case "month": if (daysDiff > 30) return false; break;
            case "year": if (daysDiff > 365) return false; break;
          }
        }

        if (activeFilters.userName.trim()) {
          const name = `${review.profiles?.first_name || ""} ${review.profiles?.last_name || ""}`.toLowerCase();
          if (!name.includes(activeFilters.userName.toLowerCase())) return false;
        }

        return true;
      });

      const startIndex = (currentPage - 1) * reviewsPerPage;
      const endIndex = startIndex + reviewsPerPage;
      setReviews(allReviews.slice(startIndex, endIndex));

      let { data: statsData } = await getReviewStats(remedy.id, ailmentContext?.id);

      // If ailment-scoped stats returned zero reviews but the remedy has
      // reviews overall, fall back to unfiltered remedy stats so the left
      // panel doesn't show 0.0 when there are remedy-level reviews.
      if (statsData && statsData.total_reviews === 0 && (ailmentContext?.id !== undefined && ailmentContext?.id !== null)) {
        try {
          const fallback = await getReviewStats(remedy.id);
          if (fallback && fallback.data && fallback.data.total_reviews > 0) {
            statsData = fallback.data;
          }
        } catch (err) {
          console.error('Failed to fetch fallback stats:', err);
        }
      }

      if (statsData) {
        setReviewStats(statsData);
        setTotalReviews(allReviews.length);
        setTotalPages(Math.ceil(allReviews.length / reviewsPerPage));
      }

      const { data: filterData } = await getReviewFilterOptions(remedy.id);
      if (filterData) setFilterOptions(filterData);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsInitialLoading(false);
      setIsPageLoading(false);
    }
  };

  // ---------------------------
  // Effects
  // ---------------------------
  useEffect(() => {
    fetchReviews(false);
  }, [remedy.id]);

  useEffect(() => {
    setActiveFilters({
      dosage: filters.dosage,
      dateRange: filters.dateRange,
      form: filters.form,
      userName: filters.userName,
    });
  }, [filters]);

  useEffect(() => {
    fetchReviews(false);
    setCurrentPage(1);
  }, [filters, sortBy, searchQuery, activeFilters]);

  useEffect(() => {
    if (currentPage > 1 || totalReviews > reviewsPerPage) {
      fetchReviews(true);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------
  // Handlers
  // ---------------------------
  const handleReviewButtonClick = async () => {
    const { user, error } = await getCurrentUser();
    if (error || !user) return router.push("/login");
    setIsReviewFormOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document.getElementById("Reviews")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const refreshReviews = () => fetchReviews(false);

  const sortOptions: { label: string; value: SortBy }[] = [
    { label: "Most Recent", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Highest Rated", value: "highest_rated" },
    { label: "Lowest Rated", value: "lowest_rated" },
  ];

  // Delete a review (owner only) via server API and update local state

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const openDeleteModal = (reviewId: string) => {
    setPendingDeleteId(reviewId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setPendingDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  const performDeleteConfirmed = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to delete review');
      }

      // remove from visible lists
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setAllReviewsList(prev => prev.filter(r => r.id !== reviewId));
      setTotalReviews(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review: ' + (err?.message || err));
    }
  };

  if (!remedy) return <div>Loading remedy details...</div>;

  return (
    <div>
      <section id="Reviews" className="bg-white rounded-2xl md:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 md:gap-6 sm:gap-10">
          {/* Left Panel – Ratings Summary */}
          <aside className="col-span-1 mb-6 lg:mb-0 lg:max-w-[262px]">
            <div className="flex flex-col text-left">
              <p className="text-base sm:text-[20px] text-[#0B0C0A] font-semibold mb-2">Reviews</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <Image src="/star.svg" alt="Star" width={36} height={36} className="sm:w-12 sm:h-12" />
                <h2 className="text-4xl sm:text-4xl lg:text-[32px] xl:text-[40px] font-bold text-gray-800 mt-2 sm:mt-3">
                  {reviewStats ? reviewStats.average_rating.toFixed(1) : "0.0"}
                </h2>
              </div>
              {/* <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                Based on {reviewStats?.total_reviews ?? 0} {(reviewStats?.total_reviews ?? 0) === 1 ? "review" : "reviews"}
              </p> */}

              <div className="mt-3 ml-[-8px] w-full flex flex-col gap-2.5  mb-4 sm:mb-6">
                {reviewStats && [5, 4, 3, 2, 1].map((star) => {
                  const percentage = reviewStats.total_reviews > 0 ? (reviewStats.rating_distribution[star] / reviewStats.total_reviews) * 100 : 0;
                  const isActive = filters.rating.includes(star);
                  return (
                    <button
                      key={star}
                      onClick={() => setFilters((prev) => ({ ...prev, rating: prev.rating.includes(star) ? [] : [star] }))}
                      className={`flex items-center text-sm sm:text-sm w-full rounded-lg  hover:bg-[#6C74631A] px-3 py-2 transition ${isActive ? "bg-[#6C74631A]" : "border-[#6C74631A]/10 "} `} >
                      <Image src="/star.svg" alt={`${star} Star`} width={15} height={15} className="sm:w-4 sm:h-4 mr-1" />
                      <span className="w-3 text-gray-700 font-medium mr-3">{star}</span>
                      <div className="flex-1 h-2 bg-[#4B544A]/20 rounded-xl overflow-hidden w-[196px]">
                        <div className="h-full transition-all duration-300 rounded-xl bg-[#6C7463]" style={{ width: `${percentage}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleReviewButtonClick}
                className="bg-[#6C7463] hover:bg-[#5A6B5D] text-white px-3 py-2.5 sm:px-5 rounded-full sm:text-base font-semibold transition w-full sm:max-w-[246px] h-[44px] mx-auto cursor-pointer"
              >
                Review Remedy
              </button>
            </div>
          </aside>

          {/* Right Panel – Reviews List */}
          <div className="col-span-2">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="relative w-full sm:flex-1 sm:mr-6 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Search reviews..."
                    className="w-full h-[40px] pl-11 pr-4 py-3 sm:h-[48px] border border-[#B5B6B1] rounded-[8px] sm:text-base text-[#41463B] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent placeholder:text-[#41463B] placeholder:font-medium font-family-montserrat"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Button */}
                <div className="relative" ref={filterDropdownRef}>

                  {/* Filter Button INSIDE Input */}
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-2 sm:w-[44px] w-[40px] sm:h-[44px] h-[36px] bg-[#6C7463] hover:bg-[#5A6B5D]text-white rounded-[8px] transition-colors flex items-center justify-center cursor-pointer border border-[1px] border-[#B5B6B1] outline-none"
                  >
                    <SlidersHorizontal className="w-[22px] h-[18px]" />
                    {filters.rating.length + filters.dosage.length + filters.form.length + (filters.dateRange !== "all" ? 1 : 0) + (filters.userName ? 1 : 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {filters.rating.length + filters.dosage.length + filters.form.length + (filters.dateRange !== "all" ? 1 : 0) + (filters.userName ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Sort By */}
              <div className="flex items-center justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-center relative" ref={dropdownRef}>
                <span className="sm:font-semibold font-regular text-[#2B2E28] sm:text-base text-sm leading-[24px]  whitespace-nowrap text-montserrat">Sort by:</span>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="cursor-pointer appearance-none sm:pl-1 pr-5 py-2 sm:text-base text-sm leading-[24px] min-w-[130px] text-[#20231E] font-medium focus:outline-none" >
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  <ChevronDown className={`absolute right-0 sm:right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#20231E] pointer-events-none transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 top-full left-0  bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setIsDropdownOpen(false); }}
                        className={`cursor-pointer px-3 py-2 w-full text-sm text-start transition ${sortBy === opt.value ? "bg-[#6C7463] text-white font-medium" : "text-gray-700 hover:bg-[#6c74631f] font-medium hover:text-[#6C7463]"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Review Section */}
            {isInitialLoading ? (
              <div className="flex justify-center items-center py-6 sm:py-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 sm:py-10 text-gray-500">
                <p className="font-medium">No reviews yet.</p>
                <p className="text-xs sm:text-sm">Be the first to review this remedy!</p>
              </div>
            ) : (
              <>
                {isPageLoading && (
                  <div className="flex justify-center items-center py-3">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    <span className="ml-2 text-gray-500 text-sm">Loading more...</span>
                  </div>
                )}

                {reviews.map((review) => {
                  const userName = review.profiles?.first_name || review.profiles?.last_name
                    ? `${review.profiles?.first_name || ""} ${review.profiles?.last_name?.[0] || ""}.`
                    : "Anonymous";

                  const user_name = review.profiles?.user_name;
                  const profile_image = review.profiles?.profile_img;
                  const secondaryRemedies = review.secondary_remedies || [];
                  // Derive a stable list of combination remedy names from several possible shapes
                  const combinationNames: string[] = ((): string[] => {
                    if (Array.isArray(secondaryRemedies) && secondaryRemedies.length > 0) {
                      return secondaryRemedies.map((r: any) => (typeof r === 'string' ? r : r?.name || r?.label || '')).filter(Boolean);
                    }
                    if (Array.isArray((review as any).secondary_remedy_names) && (review as any).secondary_remedy_names.length > 0) {
                      return (review as any).secondary_remedy_names.map((n: any) => String(n)).filter(Boolean);
                    }
                    if (Array.isArray((review as any).secondary_remedy_ids) && (review as any).secondary_remedy_ids.length > 0) {
                      // As a last resort, show the raw ids (better than empty UI). Ideally these are enriched by the server.
                      return (review as any).secondary_remedy_ids.map((id: any) => String(id)).filter(Boolean);
                    }
                    return [];
                  })();

                  // Resolve ailment display (icon + name) with fallbacks (cast to any to avoid strict Review typing)
                  let ailmentIcon = (review as any)?.ailment?.icon ?? (review as any)?.ailment_icon ?? (review as any)?.ailmentIcon ?? (review as any)?.ailment?.emoji ?? null;

                  let ailmentName = (review as any)?.ailment?.name ?? (review as any)?.ailment_name ?? (review as any)?.ailmentName ?? (review as any)?.ailment?.label ?? null;

                  const ailmentIdRaw = (review as any)?.ailment_id ?? (typeof (review as any)?.ailment === 'string' ? (review as any).ailment : (review as any)?.ailment?.id);
                  const ailmentId = ailmentIdRaw ? String(ailmentIdRaw) : null;

                  // Use prebuilt ailmentMap (populated from fetched reviews) when available
                  if (ailmentId && ailmentMap[ailmentId]) {
                    const fetched = ailmentMap[ailmentId];
                    ailmentName = ailmentName || fetched.name || null;
                    ailmentIcon = ailmentIcon || fetched.icon || null;
                  }

                  // fallback to surrounding context's ailment if available
                  if ((!ailmentName || !ailmentIcon) && ailmentContext) {
                    ailmentName = ailmentName || ailmentContext.name;
                    ailmentIcon = ailmentIcon || null;
                  }

                  const usageTags = processUsageTags([
                    review.dosage,
                    review.potency,
                    review.potency_2,
                    review.duration_used
                  ]);

                  return (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/user/${user_name}`)}
                      className="border-b border-[#B5B6B1]/50 w-full py-4 sm:py-6 cursor-pointer sm:last:border-b-0 mobile-hide-last-two"
                    >
                      <div className="flex custom-320 flex-row items-start justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex items-center justify-center w-11 h-11 sm:w-[44px] sm:h-[44px] rounded-full bg-[#4B544A] text-white font-semibold text-lg sm:text-base shadow-sm overflow-hidden">
                            {profile_image ? (
                              <img src={profile_image} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                              userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B0C0A] hover:underline text-[16px] sm:text-base">{userName}</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.star_count)}
                              <span className="ml-1 text-[16px] text-[#20231E] font-medium">{review.star_count.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* <p className="text-[14px] text-[#83857D]">{formatTimeAgo(review.created_at)}</p> */}

                        <div
                          ref={menuRef}
                          className="relative flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()} // prevent navigation
                        >
                          <p className="text-[14px] leading-[22px] font-medium text-[#83857D]">
                            {formatTimeAgo(review.created_at)}
                          </p>

                          {user && user.id === review.user_id && (
                            <>
                              {/* 3-dot button */}
                              <button
                                onClick={() =>
                                  setOpenMenuId(openMenuId === review.id ? null : review.id)
                                }
                                className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                              >
                                <span className="text-lg leading-none">
                                  <svg width="4" height="18" viewBox="0 0 4 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 0C0.9 0 0 0.9 0 2C0 3.1 0.9 4 2 4C3.1 4 4 3.1 4 2C4 0.9 3.1 0 2 0ZM2 14C0.9 14 0 14.9 0 16C0 17.1 0.9 18 2 18C3.1 18 4 17.1 4 16C4 14.9 3.1 14 2 14ZM2 7C0.9 7 0 7.9 0 9C0 10.1 0.9 11 2 11C3.1 11 4 10.1 4 9C4 7.9 3.1 7 2 7Z" fill="#41463B" />
                                  </svg>
                                </span>
                              </button>

                              {/* Dropdown */}
                              {openMenuId === review.id && (
                                <div className="absolute right-0 top-7 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      console.log("Edit", user_name);
                                    }}
                                    className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#20231E] hover:bg-gray-100 font-semibold cursor-pointer"
                                  >
                                    <span className="w-[16px] h-[16px]">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M11.1713 2.00039L9.838 3.33372H3.33333V12.6671H12.6667V6.16239L14 4.82906V13.3337C14 13.5105 13.9298 13.6801 13.8047 13.8051C13.6797 13.9302 13.5101 14.0004 13.3333 14.0004H2.66667C2.48986 14.0004 2.32029 13.9302 2.19526 13.8051C2.07024 13.6801 2 13.5105 2 13.3337V2.66706C2 2.49025 2.07024 2.32068 2.19526 2.19565C2.32029 2.07063 2.48986 2.00039 2.66667 2.00039H11.1713V2.00039ZM13.6567 1.40039L14.6 2.34439L8.472 8.47239L7.53067 8.47439L7.52933 7.52972L13.6567 1.40039V1.40039Z" fill="#20231E" />
                                      </svg>
                                    </span>
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      openDeleteModal(review.id);
                                    }}
                                    className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#20231E] hover:bg-gray-100 font-semibold cursor-pointer"
                                  >
                                    <span className="w-[16px] h-[16px]">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M11.333 3.99967H14.6663V5.33301H13.333V13.9997C13.333 14.1765 13.2628 14.3461 13.1377 14.4711C13.0127 14.5961 12.8432 14.6663 12.6663 14.6663H3.33301C3.1562 14.6663 2.98663 14.5961 2.8616 14.4711C2.73658 14.3461 2.66634 14.1765 2.66634 13.9997V5.33301H1.33301V3.99967H4.66634V1.99967C4.66634 1.82286 4.73658 1.65329 4.8616 1.52827C4.98663 1.40325 5.1562 1.33301 5.33301 1.33301H10.6663C10.8432 1.33301 11.0127 1.40325 11.1377 1.52827C11.2628 1.65329 11.333 1.82286 11.333 1.99967V3.99967ZM11.9997 5.33301H3.99967V13.333H11.9997V5.33301ZM5.99967 7.33301H7.33301V11.333H5.99967V7.33301ZM8.66634 7.33301H9.99967V11.333H8.66634V7.33301ZM5.99967 2.66634V3.99967H9.99967V2.66634H5.99967Z" fill="#20231E" />
                                      </svg>
                                    </span>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ailment (icon + name) - shown above combination, matching UserReview styling */}
                      {ailmentName && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs text-[#2B2E28] font-medium">Ailment:</span>
                          <span className="font-medium bg-[#F5F3ED] px-2 py-1 text-xs text-[#0B0C0A]"> {ailmentName}</span>
                        </div>
                      )}

                      {/* UPDATED: Single grey container with increased spacing between bracketed remedies */}
                      {combinationNames.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                          <span className="text-[13px] font-medium text-[#2B2E28] mr-1">
                            Used in Combination with:
                          </span>

                          <div className="text-[12px] px-3 py-1 rounded-[4px] bg-[#F1F2F0] text-[#41463B] font-medium">
                            {combinationNames.map((name) => (
                              <span key={name} className="mr-[10px]">[{name}]</span>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Pill Containers - Usage details like "Pellet", "6C" */}
                      {usageTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {usageTags.map((tag, i) => (
                            <span
                              key={`${tag}-${i}`}
                              className="text-[12px] font-medium px-3 py-1 rounded-md text-[#2B2E28] border border-[#B5B6B1] bg-white"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {review.notes && <p className="text-[#0B0C0A] text-[14px] leading-5 font-medium sm:text-sm">{review.notes}</p>}
                    </div>
                  );
                })}

                {totalReviews > reviewsPerPage && (
                  <div className="mt-6 flex justify-center items-center gap-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1 text-[#0B0C0A] hover:text-[#6C7463] disabled:opacity-50"
                      aria-label="Previous reviews page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-[40px] h-[40px] rounded-full text-xs font-medium transition-colors flex items-center justify-center ${currentPage === page
                          ? 'bg-[#6C7463] text-white'
                          : 'bg-[#F5F3ED] text-[#41463B] hover:bg-[#6C7463] hover:text-white'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1 text-[#0B0C0A] hover:text-[#6C7463] disabled:opacity-50"
                      aria-label="Next reviews page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ReviewFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(appliedFilters: ReviewFilters) => setFilters(appliedFilters)}
          totalResults={totalReviews}
          dosageOptions={filterOptions.potencies}
          formOptions={filterOptions.forms}
          currentFilters={filters}
          allReviews={allReviesList}
        />
      </section>

      {isReviewFormOpen && (
        <AddReviewForm
          onClose={() => { setIsReviewFormOpen(false); refreshReviews(); }}
          remedyId={remedy.id}
          remedyName={remedy.name}
          condition={ailmentContext?.name || "your condition"}
          ailmentId={ailmentContext?.id}
        />
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={closeDeleteModal} />
          <div className="bg-white rounded-lg shadow-lg z-50 w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-[#0B0C0A] mb-2">Delete review</h3>
            <p className="text-sm text-[#41463B] mb-4">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-md border border-[#B5B6B1] text-[#41463B] bg-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!pendingDeleteId) return;
                  await performDeleteConfirmed(pendingDeleteId);
                  closeDeleteModal();
                }}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}