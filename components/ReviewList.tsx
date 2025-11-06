"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, StarHalf, StarOff, Search, Loader2, StarIcon, ChevronDown } from "lucide-react";
import Image from "next/image"; // Import next/image
import { getReviews, getReviewFilterOptions, getReviewStats } from "@/lib/review";
import { getCurrentUser } from "@/lib/auth";
import ReviewFilterModal, { ReviewFilters } from "./ReviewFilterModal";
import AddReviewForm from "./AddReviewForm";
import { Remedy, Review as ReviewType } from "@/types";

// ---------------------------
// Type Definitions
// ---------------------------
interface ReviewListPageProps {
  remedy: Remedy & {
    id:string,
    name:string,
    // Add other fields from your Supabase table here if they are not in the base Remedy type
    scientific_name?: string;
    common_name?: string;
    constitutional_type?: string;
    dosage_forms?: string[];
    safety_precautions?: string;
  }
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
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
};


// ---------------------------
// Main Component
// ---------------------------

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
        <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`}>
            <Image
              src="/star.svg" 
              alt="Star"
              width={16}
              height={16}
            />
          </span>
        ))}
        {hasHalfStar && (
          <span key="half">
            <Image 
              src="/star-half.svg" // Assuming you have a half-star icon
              alt="Half Star"
              width={16}
              height={16}
            />
          </span>
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <span key={`empty-${i}`}>
            <Image 
              src="/star-blank.svg" 
              alt="Empty Star"
              width={16}
              height={16}
            />
          </span>
        ))}
      </div>
    );
  }


export default function ReviewListPage({ remedy, ailmentContext }: ReviewListPageProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_rated' | 'lowest_rated'>("newest");
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewsPerPage] = useState(15);

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({
    rating: [],
    dosage: [],
    form: [],
  });
  const [filterOptions, setFilterOptions] = useState<{ potencies: string[]; forms: string[] }>({
    potencies: [],
    forms: [],
  });
  const [reviewStats, setReviewStats] = useState<{
    star_count: number;
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  } | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!remedy.id) return;
      setIsLoading(true);
      
      try {
        // Fetch reviews - for now we'll load more than needed and paginate client-side
        // TODO: Update getReviews function to support proper offset-based pagination
        const { data: reviewsData, error: reviewsError } = await getReviews({ 
          remedyId: remedy.id, 
          ailmentId: ailmentContext ? ailmentContext.id : undefined, // Explicitly pass undefined when no ailment context
          limit: Math.max(reviewsPerPage * 3, 50), // Load enough for a few pages
          sortBy: sortBy,
          starCount: filters.rating,
          searchQuery: searchQuery,
          potency: filters.dosage,
        });
        
        if (reviewsError) throw reviewsError;
        
        // Store all fetched reviews for client-side pagination
        const allReviews = reviewsData || [];
        
        // Implement client-side pagination
        const startIndex = (currentPage - 1) * reviewsPerPage;
        const endIndex = startIndex + reviewsPerPage;
        const paginatedReviews = allReviews.slice(startIndex, endIndex);
        setReviews(paginatedReviews);

        // Fetch review stats to get total count
        const { data: statsData, error: statsError } = await getReviewStats(remedy.id, ailmentContext ? ailmentContext.id : undefined);
        if (statsError) throw statsError;
        
        if (statsData) {
          setReviewStats({ ...statsData, star_count: statsData.average_rating });
          setTotalReviews(statsData.total_reviews);
          setTotalPages(Math.ceil(statsData.total_reviews / reviewsPerPage));
        }

        // Fetch filter options
        const { data: filterData, error: filterError } = await getReviewFilterOptions(remedy.id);
        if (filterError) throw filterError;
        if (filterData) {
          setFilterOptions(filterData);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [remedy.id, ailmentContext, sortBy, filters, currentPage, reviewsPerPage, searchQuery]);

  useEffect(() => {
    // Reset to page 1 when filters or sort order changes
    setCurrentPage(1);
  }, [filters, sortBy, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: scroll to top of reviews section
      const reviewSection = document.getElementById("Reviews");
      reviewSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleReviewButtonClick = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        // User is not authenticated, redirect to login
        router.push('/login');
        return;
      }
      // User is authenticated, open the review form
      setIsReviewFormOpen(true);
    } catch (err) {
      console.error('Authentication check failed:', err);
      router.push('/login');
    }
  };

  const refreshReviews = async () => {
    if (!remedy.id) return;
    setIsLoading(true);
    
    try {
      // Reset to first page when refreshing
      setCurrentPage(1);
      
      // Fetch fresh review stats
      const { data: statsData, error: statsError } = await getReviewStats(remedy.id, ailmentContext ? ailmentContext.id : undefined);
      if (statsError) throw statsError;
      
      if (statsData) {
        setReviewStats({ ...statsData, star_count: statsData.average_rating });
        setTotalReviews(statsData.total_reviews);
        setTotalPages(Math.ceil(statsData.total_reviews / reviewsPerPage));
      }


      // Fetch fresh reviews
      const { data: reviewsData, error: reviewsError } = await getReviews({ 
        remedyId: remedy.id, 
        ailmentId: ailmentContext ? ailmentContext.id : undefined,
        limit: Math.max(reviewsPerPage * 3, 50),
        sortBy: sortBy,
        starCount: filters.rating,
        searchQuery: searchQuery,
        potency: filters.dosage,
      });
      
      if (reviewsError) throw reviewsError;
      
      const allReviews = reviewsData || [];
      const paginatedReviews = allReviews.slice(0, reviewsPerPage); // First page
      setReviews(paginatedReviews);

    } catch (error) {
      console.error("Failed to refresh reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortOptions: { label: string; value: typeof sortBy }[] = [
    { label: "Most Recent", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Highest Rated", value: "highest_rated" },
    { label: "Lowest Rated", value: "lowest_rated" },
  ];

  if (!remedy) {
    return <div>Loading remedy details...</div>; // Or a 404 component
  }

  return (
    <div>
      <section id="Reviews" className="bg-white rounded-2xl shadow-sm p-8 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left – Rating Summary */}
        <aside className="col-span-1">
          <div className="flex flex-col items-left text-left p-6">
            {/* <h2 className="text-2xl font-semibold text-gray-800 mb-3">Review</h2> */}
            <p className="text-[20px] text-[#0B0C0A] font-semibold mb-2">Reviews</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-serif text-gray-800">
               <Image 
                  src="/star.svg" 
                  alt="Star"
                  width={48}
                  height={48}
                />
              </span>
              <h2 className="text-4xl font-bold text-gray-800 mt-3">
                {reviewStats ? reviewStats.average_rating.toFixed(1) : remedy.average_rating.toFixed(1)}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Based on {reviewStats ? reviewStats.total_reviews.toLocaleString() : remedy.review_count.toLocaleString()} reviews
            </p>

            {/* Rating Bars */}
            <div className="w-full space-y-2 mb-6">
              {reviewStats && [5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm w-full">
                  <span className="w-4 h-4 text-yellow-400 fill-yellow-400 ">
                    <Image 
                                  src="/star.svg" 
                                  alt="Star"
                                  width={16}
                                  height={16}
                                />
                  </span>
                  <span className="w-3 text-gray-700 font-medium">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-[#6C7463] rounded-full"
                      style={{ width: `${reviewStats.total_reviews > 0 ? (reviewStats.rating_distribution[star] / reviewStats.total_reviews) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

             <button 
                  onClick={handleReviewButtonClick}
                  className="bg-[#6C7463] hover:bg-[#5A6B5D] text-white px-5 py-2 rounded-full text-sm font-medium transition"
                >
                  Review Remedy
                </button>
          </div>
        </aside>

        {/* Right – Reviews List */}
        <div className="col-span-2">
          {/* Header: Search + Sort */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md mr-[5pc]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Search reviews..."
                className="w-full pl-11 pr-14 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#6B7C6E] hover:bg-[#5A6B5D] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* This is a simplified dropdown. For a real app, you'd use a dropdown component library */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors bg-transparent border border-gray-200"
              >
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="font-medium">No reviews yet.</p>
                <p className="text-sm">Be the first to review this remedy!</p>
              </div>
            ) : (
              reviews.map((review) => {
                const userName = review.profiles?.first_name ? `${review.profiles.first_name} ${review.profiles.last_name?.charAt(0) || ''}.` : "Anonymous";
                const userInitial = userName.charAt(0).toUpperCase();
                const tags = [review.dosage, review.potency].filter(Boolean);

                return (
                  <div
                    key={review.id}
                    className="border-b border-[#B5B6B1] w-full  p-6 "
                  >
                    <div className="flex items-start justify-between mb-3">
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E6E3DA] flex items-center justify-center text-sm font-semibold text-gray-700">
                          {userInitial}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{userName}</p>
                          <div className="flex items-center gap-1">
                            {renderStars(review.star_count)}
                            <span className="ml-1 text-sm text-gray-600">
                              {review.star_count.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time */}
                      <p className="text-sm text-gray-500">{formatTimeAgo(review.created_at)}</p>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-[#F5F1E8] px-2 py-1 rounded-md text-gray-700 border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Text */}
                    {review.notes && (
                      <p className="text-gray-700 text-sm leading-relaxed">{review.notes}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination - only show if there are more than 15 reviews */}
          {totalReviews > 15 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              {(() => {
                const maxVisible = 2;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }
                
                const pages = [];
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }
                
                return pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? "bg-[#6C7463] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          )}
        
        </div>
      </div>
      <ReviewFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(appliedFilters) => {
          setFilters(appliedFilters);
        }}
        // You might want to calculate the actual number of reviews
        totalResults={reviews.length}
        dosageOptions={filterOptions.potencies}
        formOptions={filterOptions.forms}
      />
    </section>
    {isReviewFormOpen && (
      <AddReviewForm 
        onClose={() => {
          setIsReviewFormOpen(false);
          refreshReviews(); // Refresh reviews when form closes
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
