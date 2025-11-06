"use client";
import { useState } from 'react';
import ReviewFilterModal from './ReviewFilterModal';
import {Review} from '@/types'

// interface Review {
//   id: string;
//   user: string;
//   rating: number;
//   verified: boolean;
//   date: string;
//   comment: string;
//   dosage?: string;
//   form?: string;
// }

interface ReviewsWithFilterProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export default function ReviewsWithFilter({
  reviews: initialReviews,
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewsWithFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState(initialReviews);
  const [activeFilters, setActiveFilters] = useState<any>({
    rating: [],
    dosage: [],
    form: [],
  });

  const applyFilters = (filters: any) => {
    setActiveFilters(filters);
    
    let filtered = initialReviews;

    // Filter by rating
    if (filters.rating.length > 0) {
      filtered = filtered.filter(review => filters.rating.includes(review.rating));
    }

    // Filter by dosage
    if (filters.dosage.length > 0) {
      filtered = filtered.filter(review => 
        review.dosage && filters.dosage.includes(review.dosage)
      );
    }

    // Filter by form
    if (filters.form.length > 0) {
      filtered = filtered.filter(review => 
        review.form && filters.form.includes(review.form)
      );
    }

    setFilteredReviews(filtered);
  };

  const hasActiveFilters = 
    activeFilters.rating.length > 0 || 
    activeFilters.dosage.length > 0 || 
    activeFilters.form.length > 0;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-gray-900">Reviews</h2>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">⚙️</span>
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-[#6B7B5E] text-white text-xs rounded-full">
                {activeFilters.rating.length + activeFilters.dosage.length + activeFilters.form.length}
              </span>
            )}
          </button>
        </div>

        {/* Rating Summary */}
        <div className="flex items-start gap-8 pb-6 border-b border-gray-200 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
            <div className="flex text-yellow-400 text-2xl mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < Math.floor(averageRating) ? '★' : '☆'}</span>
              ))}
            </div>
            <p className="text-sm text-gray-600">{totalReviews} reviews</p>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-600 w-8">{stars}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(ratingDistribution[stars] / totalReviews) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{ratingDistribution[stars]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeFilters.rating.map((rating: number) => (
              <span key={`rating-${rating}`} className="px-3 py-1 bg-[#6B7B5E]/10 text-[#6B7B5E] rounded-full text-sm flex items-center gap-2">
                {rating}★
                <button
                  onClick={() => applyFilters({
                    ...activeFilters,
                    rating: activeFilters.rating.filter((r: number) => r !== rating)
                  })}
                  className="hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
            {activeFilters.dosage.map((dosage: string) => (
              <span key={`dosage-${dosage}`} className="px-3 py-1 bg-[#6B7B5E]/10 text-[#6B7B5E] rounded-full text-sm flex items-center gap-2">
                {dosage}
                <button
                  onClick={() => applyFilters({
                    ...activeFilters,
                    dosage: activeFilters.dosage.filter((d: string) => d !== dosage)
                  })}
                  className="hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
            {activeFilters.form.map((form: string) => (
              <span key={`form-${form}`} className="px-3 py-1 bg-[#6B7B5E]/10 text-[#6B7B5E] rounded-full text-sm flex items-center gap-2">
                {form}
                <button
                  onClick={() => applyFilters({
                    ...activeFilters,
                    form: activeFilters.form.filter((f: string) => f !== form)
                  })}
                  className="hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setActiveFilters({ rating: [], dosage: [], form: [] });
                setFilteredReviews(initialReviews);
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews match your filters. Try adjusting your criteria.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{review.user}</span>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">✓ Verified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {filteredReviews.length > 0 && filteredReviews.length < initialReviews.length && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Showing {filteredReviews.length} of {initialReviews.length} reviews
          </p>
        )}

        {filteredReviews.length === initialReviews.length && filteredReviews.length > 5 && (
          <button className="w-full mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Load More Reviews
          </button>
        )}
      </div>

      <ReviewFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyFilters}
        totalResults={filteredReviews.length} dosageOptions={[]} formOptions={[]}      />
    </>
  );
}
