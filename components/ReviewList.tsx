"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  getReviews,
  getReviewFilterOptions,
  getReviewStats,
} from "@/lib/review";
import { getCurrentUser } from "@/lib/auth";
import ReviewFilterModal, { ReviewFilters } from "./ReviewFilterModal";
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
    [60, "minute"],
  ];

  for (const [secondsInUnit, label] of intervals) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval > 1) return `${interval} ${label}s ago`;
    if (interval === 1) return `1 ${label} ago`;
  }

  return "Just now";
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
        <Image key={`full-${i}`} src="/star.svg" alt="Star" width={16} height={16} />
      ))}
      {hasHalfStar && (
        <Image key="half" src="/star-half-fill.svg" alt="Half Star" width={16} height={16} />
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <Image key={`empty-${i}`} src="/star-line.svg" alt="Empty Star" width={16} height={16} />
      ))}
    </div>
  );
};

// ---------------------------
// Main Component
// ---------------------------
export default function ReviewListPage({ remedy, ailmentContext }: ReviewListPageProps) {
  const router = useRouter();

  // States
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [filterOptions, setFilterOptions] = useState<{ potencies: string[]; forms: string[] }>({
    potencies: [],
    forms: [],
  });

  const [filters, setFilters] = useState<ReviewFilters>({
    rating: [],
    dosage: [],
    form: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest_rated" | "lowest_rated">(
    "newest"
  );
const dropdownRef = useRef<HTMLDivElement>(null);

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  

  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(15);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 👇 Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);

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
      });

      const allReviews = reviewsData || [];
      const startIndex = (currentPage - 1) * reviewsPerPage;
      const endIndex = startIndex + reviewsPerPage;
      setReviews(allReviews.slice(startIndex, endIndex));

      const { data: statsData } = await getReviewStats(remedy.id, ailmentContext?.id);
      if (statsData) {
        setReviewStats({ ...statsData, star_count: statsData.average_rating });
        setTotalReviews(statsData.total_reviews);
        setTotalPages(Math.ceil(statsData.total_reviews / reviewsPerPage));
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
    // When filters, sort, or search change, silently update without spinner
    fetchReviews(false);
    setCurrentPage(1);
  }, [filters, sortBy, searchQuery]);

  useEffect(() => {
    // When only page changes → show pagination loading
    if (currentPage > 1 || totalReviews > reviewsPerPage) {
      fetchReviews(true);
    }
  }, [currentPage]);

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
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const refreshReviews = () => fetchReviews(false);

  const sortOptions = [
    { label: "Most Recent", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Highest Rated", value: "highest_rated" },
    { label: "Lowest Rated", value: "lowest_rated" },
  ];

  // ---------------------------
  // Render
  // ---------------------------
  if (!remedy) return <div>Loading remedy details...</div>;

  return (
    <div>
      <section id="Reviews" className="bg-white rounded-2xl shadow-sm p-4 sm:p-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          {/* Left Panel – Ratings Summary */}
          <aside className="col-span-1 mb-6 lg:mb-0">
            <div className="flex flex-col text-left p-3 sm:p-6">
              <p className="text-base sm:text-[20px] text-[#0B0C0A] font-semibold mb-2">Reviews</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <Image src="/star.svg" alt="Star" width={36} height={36} className="sm:w-12 sm:h-12" />
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mt-2 sm:mt-3">
                  {reviewStats ? reviewStats.average_rating.toFixed(1) : "0.0"}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                Based on {reviewStats?.total_reviews ?? 0}{" "}
             {(reviewStats?.total_reviews ?? 0) === 1 ? "review" : "reviews"}
              </p>

              {/* Rating Filters */}
              <div className="w-full space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {reviewStats &&
                  [5, 4, 3, 2, 1].map((star) => {
                    const percentage =
                      reviewStats.total_reviews > 0
                        ? (reviewStats.rating_distribution[star] / reviewStats.total_reviews) * 100
                        : 0;
                    const isActive = filters.rating.includes(star);

                    return (
                      <button
                        key={star}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            rating: prev.rating.includes(star) ? [] : [star],
                          }))
                        }
                        className={`flex items-center gap-2 text-xs sm:text-sm w-full ${
                          isActive
                            ? "border-[#6C7463] bg-gray-50 opacity-100 scale-[1.02]"
                            : "border-[#6C74631A] opacity-80 hover:opacity-100 hover:bg-[#6C74631A] rounded-md"
                        }`}
                      >
                        <Image src="/star.svg" alt={`${star} Star`} width={14} height={14} className="sm:w-4 sm:h-4" />
                        <span className="w-3 text-gray-700 font-medium">{star}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-xl overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-xl ${
                              isActive ? "bg-[#6C7463]" : "bg-[#A6AD9E]"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={handleReviewButtonClick}
                className="bg-[#6C7463] hover:bg-[#5A6B5D] text-white px-3 py-2 sm:px-5 rounded-full text-xs sm:text-sm font-medium transition w-full sm:w-auto"
              >
                Review Remedy
              </button>
            </div>
          </aside>

          {/* Right Panel – Reviews List */}
          <div className="col-span-2">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="relative flex-1 w-full max-w-full sm:max-w-md sm:mr-[5pc]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Search reviews..."
                  className="w-full pl-11 pr-10 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center  sm:justify-start gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="font-semibold text-[#2B2E28] text-xs sm:text-sm whitespace-nowrap sm:pl-3">Sort by:</span>

              <div
             className="relative w-auto"
              ref={dropdownRef}
             >
           <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="appearance-none flex items-left justify-between gap-1 min-w-[133px] sm:min-w-[148px] sm:pl-1 py-2 text-sm sm:text-base text-[#20231E] focus:outline-none"
             >
                {sortOptions.find(opt => opt.value === sortBy)?.label}
            </button>

           <ChevronDown
             className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
            }`}
         />

  {isDropdownOpen && (
    <div className="absolute z-10 top-full w-full bg-white border border-gray-300 rounded-md shadow-lg">
      {sortOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            setSortBy(opt.value as typeof sortBy);
            setIsDropdownOpen(false);
          }}
          className={`px-2 w-full py-2 text-xs text-start sm:text-base cursor-pointer hover:bg-blue-200 hover:text-blue-700 transition-colors ${
            sortBy === opt.value
              ? "bg-blue-200 text-blue-700 font-medium"
              : "text-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )}
</div>
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
                {/* Lazy Loading Spinner — only for pagination */}
                {isPageLoading && (
                  <div className="flex justify-center items-center py-3">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    <span className="ml-2 text-gray-500 text-sm">Loading more...</span>
                  </div>
                )}

                {reviews.map((review) => {
                  const userName =
                    review.profiles?.first_name || review.profiles?.last_name
                      ? `${review.profiles?.first_name || ""} ${review.profiles?.last_name?.[0] || ""}.`
                      : "Anonymous";
                  const tags = [review.dosage, review.potency].filter(Boolean);
                  return (
                    <div key={review.id} className="border-b border-[#B5B6B1] w-full p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E6E3DA] flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-700">
                            {userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs sm:text-base">{userName}</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.star_count)}
                              <span className="ml-1 text-xs sm:text-sm text-gray-600">
                                {review.star_count.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatTimeAgo(review.created_at)}
                        </p>
                      </div>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                          {tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[12px] sm:text-xs bg-[#F5F1E8] px-2 py-1 rounded-md text-gray-700 border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {review.notes && (
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{review.notes}</p>
                      )}
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalReviews > reviewsPerPage && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(
                        Math.max(0, currentPage - 2),
                        Math.min(totalPages, currentPage + 1)
                      )
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold ${
                            currentPage === page
                              ? "bg-[#6C7463] text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 -rotate-90" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Modal */}
        <ReviewFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(appliedFilters) => setFilters(appliedFilters)}
          totalResults={reviews.length}
          dosageOptions={filterOptions.potencies}
          formOptions={filterOptions.forms}
        />
      </section>

      {/* Add Review Modal */}
      {isReviewFormOpen && (
        <AddReviewForm
          onClose={() => {
            setIsReviewFormOpen(false);
            refreshReviews();
          }}
          remedyId={remedy.id}
          remedyName={remedy.name}
          condition={ailmentContext?.name || "your condition"}
          ailmentId={ailmentContext?.id}
        />
      )}
    </div>
  );
}
