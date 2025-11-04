"use client";

import React, { useState, useEffect, useRef, useMemo, useReducer } from "react";
import { Star, StarHalf, StarOff, Search, ChevronDown, Loader2 } from "lucide-react"; // Keep these imports
import { getReviews } from "@/lib/review";
import ReviewFilterModal from "./ReviewFilterModal";
import AddReviewForm from "./AddReviewForm";
import { Remedy, Review as ReviewType } from "@/types"; // Import Remedy and Review from @/types

type State = {
  reviews: ReviewType[];
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ReviewType[] }
  | { type: 'FETCH_ERROR'; payload: string };

const initialState: State = {
  reviews: [],
  isLoading: true,
  error: null,
};

function reviewsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, reviews: action.payload };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}
// ---------------------------
// Type Definitions
// ---------------------------
interface Symptom {
  title: string;
  desc: string;
}
 // Remove the local Review interface


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
  return "Today";
};

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />);
    else if (i === fullStars && hasHalfStar)
      stars.push(<StarHalf key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />);
    else stars.push(<StarOff key={i} className="w-5 h-5 text-gray-300" />);
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

// ---------------------------
// Main Component
// ---------------------------
export default function ReviewListPage({ remedy }: ReviewListPageProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortBy, setSortBy] = useState("Most Recent");
   const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [{ reviews, isLoading, error: reviewsError }, dispatch] = useReducer(reviewsReducer, initialState);

  const sectionRefs = {
    Overview: useRef<HTMLElement>(null),
    Origin: useRef<HTMLElement>(null),
    Reviews: useRef<HTMLElement>(null),
    "Related Remedies": useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!remedy.id) return;
      dispatch({ type: 'FETCH_START' });
      try {
        const { data, error } = await getReviews({ remedyId: remedy.id, limit: 10 });
        console.log(data,"****")
        if (error) {
          throw error;
        }
        dispatch({ type: 'FETCH_SUCCESS', payload: data || [] });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Failed to fetch reviews:", errorMessage);
        dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      }
    };
    fetchReviews();
  }, [remedy.id]);

  const symptoms: Symptom[] = useMemo(() => {
    if (!remedy.key_symptoms) return [];
    // Assuming key_symptoms is an array of strings.
    // If they are in "Title: Description" format, you might need more parsing.
    return remedy.key_symptoms.map(symptom => {
      const parts = symptom.split(':');
      if (parts.length > 1) {
        return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
      }
      return { title: symptom, desc: '' };
    });
  }, [remedy.key_symptoms]);

  if (!remedy) {
    return <div>Loading remedy details...</div>; // Or a 404 component
  }

  return (
    <div>
      <section className="bg-white rounded-2xl shadow-sm p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left – Rating Summary */}
        <aside className="col-span-1">
          <div className="flex flex-col items-center text-center border border-gray-200 rounded-2xl p-6 bg-[#F9F7F2]">
            <span className="text-5xl font-serif text-gray-800 mb-2">⭐</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-1">
              {remedy.average_rating.toFixed(1)}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Based on {remedy.review_count.toLocaleString()} reviews
            </p>

            {/* Rating Bars */}
            <div className="w-full space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-700">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#6C7463] rounded-full"
                      style={{
                        width:
                          star === 5
                            ? "80%"
                            : star === 4
                            ? "12%"
                            : star === 3
                            ? "5%"
                            : star === 2
                            ? "2%"
                            : "1%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

             <button 
                  onClick={() => setIsReviewFormOpen(true)}
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

            <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="text-gray-600">Sort by:</span>
              <span className="font-medium text-gray-900">{sortBy}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviewsError ? (
              <div className="text-center py-10 text-red-500">
                <p className="font-medium">Failed to load reviews.</p>
                <p className="text-sm">{reviewsError}</p>
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
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
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
                            className="text-xs bg-[#F5F1E8] px-2 py-1 rounded-full text-gray-700 border"
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

          {/* Pagination */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  className={`w-8 h-8 rounded-full text-sm font-medium ${
                    num === 1
                      ? "bg-[#6C7463] text-white"
                      : "bg-[#F5F1E8] text-gray-700 hover:bg-[#EAE6DD]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <ReviewFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => console.log("Applying filters:", filters)}
        // You might want to calculate the actual number of reviews
        totalResults={reviews.length}
      />
    </section>
    {isReviewFormOpen && (
      <AddReviewForm 
        onClose={() => setIsReviewFormOpen(false)}
        remedyId={remedy.id}
        remedyName={remedy.name}
        condition={"your condition"}
      />
    )}

    </div>
  );
}
