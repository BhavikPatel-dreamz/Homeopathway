"use client";
import { useState } from 'react';

export interface ReviewFilters {
  rating: number[];
  dosage: string[];
  form: string[];
}

interface ReviewFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ReviewFilters) => void;
  totalResults: number;
  dosageOptions: string[];
  formOptions: string[];
}

export default function ReviewFilterModal({ isOpen, onClose, onApply, totalResults, dosageOptions = [], formOptions = [] }: ReviewFilterModalProps) {
  const [filters, setFilters] = useState<ReviewFilters>({
    rating: [],
    dosage: [],
    form: [],
  });

  // In a real scenario, you would fetch these from your database
  // and pass them as props to this component. This is now correctly
  // handled by destructuring `dosageOptions` and `formOptions` from props.
  // Default values are provided in case the props are not passed.

  if (!isOpen) return null;

  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating.includes(rating)
        ? prev.rating.filter(r => r !== rating)
        : [...prev.rating, rating]
    }));
  };

  const handleDosageChange = (dosage: string) => {
    setFilters(prev => ({
      ...prev,
      dosage: prev.dosage.includes(dosage)
        ? prev.dosage.filter(d => d !== dosage)
        : [...prev.dosage, dosage]
    }));
  };

  const handleFormChange = (form: string) => {
    setFilters(prev => ({
      ...prev,
      form: prev.form.includes(form)
        ? prev.form.filter(f => f !== form)
        : [...prev.form, form]
    }));
  };

  const clearAll = () => {
    setFilters({
      rating: [],
      dosage: [],
      form: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Rating Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Rating</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.rating.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                    className="w-4 h-4 text-[#6B7B5E] border-gray-300 rounded focus:ring-[#6B7B5E]"
                  />
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {[...Array(5 - rating)].map((_, i) => (
                      <span key={i} className="text-gray-300">☆</span>
                    ))}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dosage Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Dosage</h4>
            <div className="space-y-2">
              {dosageOptions.map((dosage) => (
                <label key={dosage} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.dosage.includes(dosage)}
                    onChange={() => handleDosageChange(dosage)}
                    className="w-4 h-4 text-[#6B7B5E] border-gray-300 rounded focus:ring-[#6B7B5E]"
                  />
                  <span className="text-gray-700">{dosage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Form</h4>
            <div className="space-y-2">
              {formOptions.map((form) => (
                <label key={form} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.form.includes(form)}
                    onChange={() => handleFormChange(form)}
                    className="w-4 h-4 text-[#6B7B5E] border-gray-300 rounded focus:ring-[#6B7B5E]"
                  />
                  <span className="text-gray-700">{form}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={clearAll}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-[#6B7B5E] text-white rounded-lg font-medium hover:bg-[#5A6A4D] transition-colors"
          >
            Show {totalResults} results
          </button>
        </div>
      </div>
    </div>
  );
}
