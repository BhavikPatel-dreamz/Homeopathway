import React from 'react';
import { X, Star } from 'lucide-react';

export interface ReviewFilters {
  rating: number[];
  dosage: string[];
  form: string[];
  dateRange: string;
  userName: string;
}

interface ReviewFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ReviewFilters) => void;
  totalResults: number;
  dosageOptions: string[];
  formOptions: string[];
  currentFilters: ReviewFilters;
  allReviews?: any[];
}

export default function ReviewFilterModal({
  isOpen,
  onClose,
  onApply,
  totalResults,
  dosageOptions,
  formOptions,
  currentFilters,
  allReviews = [],
}: ReviewFilterModalProps) {
  const [localFilters, setLocalFilters] = React.useState<ReviewFilters>(currentFilters);
  const [filteredCount, setFilteredCount] = React.useState(totalResults);

  console.log("allReviews",allReviews);
  

  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  // Calculate filtered count whenever localFilters change
  React.useEffect(() => {
    if (!allReviews.length) {
      setFilteredCount(totalResults);
      return;
    }

    let filtered = allReviews.filter((review: any) => {
      // Filter by rating
      if (localFilters.rating.length > 0 && !localFilters.rating.includes(review.star_count)) {
        return false;
      }

      // Filter by dosage
      if (localFilters.dosage.length > 0) {
        const hasMatchingDosage = localFilters.dosage.some(
          (d) => review.dosage === d || review.potency === d
        );
        if (!hasMatchingDosage) return false;
      }

      // Filter by form
      if (localFilters.form.length > 0 && !localFilters.form.includes(review.form)) {
        return false;
      }

      // Filter by date range
      if (localFilters.dateRange !== 'all') {
        const reviewDate = new Date(review.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (localFilters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      // Filter by user name
      if (localFilters.userName.trim()) {
        const userName = review.profiles?.first_name || review.profiles?.last_name
          ? `${review.profiles?.first_name || ''} ${review.profiles?.last_name || ''}`.toLowerCase()
          : 'anonymous';
        if (!userName.includes(localFilters.userName.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    setFilteredCount(filtered.length);
  }, [localFilters, allReviews, totalResults]);

  if (!isOpen) return null;

  const toggleRating = (rating: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      rating: prev.rating.includes(rating)
        ? prev.rating.filter((r) => r !== rating)
        : [...prev.rating, rating],
    }));
  };

  const toggleDosage = (dosage: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      dosage: prev.dosage.includes(dosage)
        ? prev.dosage.filter((d) => d !== dosage)
        : [...prev.dosage, dosage],
    }));
  };

  const toggleForm = (form: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      form: prev.form.includes(form)
        ? prev.form.filter((f) => f !== form)
        : [...prev.form, form],
    }));
  };

  const clearAll = () => {
    setLocalFilters({
      rating: [],
      dosage: [],
      form: [],
      dateRange: 'all',
      userName: '',
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= count
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300 stroke-2'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Rating Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Rating
            </h3>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.rating.includes(rating)}
                      onChange={() => toggleRating(rating)}
                      className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none
                        checked:bg-[#6C7463] checked:border-[#6C7463]
                        focus:ring-2 focus:ring-[#6C7463] focus:ring-offset-2 transition"
                    />
                    {localFilters.rating.includes(rating) && (
                      <svg
                        className="w-3 h-3 text-white absolute left-1 pointer-events-none"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  {renderStars(rating)}
                </label>
              ))}
            </div>
          </div>

          {/* Dosage Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Dosage
            </h3>
            <div className="space-y-2.5">
              {dosageOptions.map((dosage: any) => (
                <label
                  key={dosage}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.dosage.includes(dosage)}
                      onChange={() => toggleDosage(dosage)}
                      className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none
                        checked:bg-[#6C7463] checked:border-[#6C7463]
                        focus:ring-2 focus:ring-[#6C7463] focus:ring-offset-2 transition"
                    />
                    {localFilters.dosage.includes(dosage) && (
                      <svg
                        className="w-3 h-3 text-white absolute left-1 pointer-events-none"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium text-[15px]">{dosage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Form</h3>
            <div className="space-y-2.5">
              {formOptions.map((form: any) => (
                <label
                  key={form}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.form.includes(form)}
                      onChange={() => toggleForm(form)}
                      className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer appearance-none
                        checked:bg-[#6C7463] checked:border-[#6C7463]
                        focus:ring-2 focus:ring-[#6C7463] focus:ring-offset-2 transition"
                    />
                    {localFilters.form.includes(form) && (
                      <svg
                        className="w-3 h-3 text-white absolute left-1 pointer-events-none"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium text-[15px]">{form}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Period Section */}
          <div className="mb-6">
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Time Period
            </label>
            <select
              value={localFilters.dateRange}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  dateRange: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-300 text-gray-700 rounded-md text-sm 
                focus:outline-none focus:ring-2 focus:ring-[#6C7463] focus:border-[#6C7463] transition"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>

          {/* Reviewer Name Section */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Reviewer Name
            </label>
            <input
              type="text"
              placeholder="Filter by name..."
              value={localFilters.userName}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  userName: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 text-gray-700 border-2 border-gray-300 rounded-md text-sm 
                focus:outline-none focus:ring-2 focus:ring-[#6C7463] focus:border-[#6C7463] transition
                placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-white">
          <button
            onClick={clearAll}
            className="text-gray-700 font-medium hover:text-gray-900 transition text-[15px]"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-[#6C7463] hover:bg-[#5A6B5D] text-white px-8 py-2.5 rounded-lg font-medium transition text-[15px]"
          >
            Show {filteredCount.toLocaleString()} results
          </button>
        </div>
      </div>
    </div>
  );
}