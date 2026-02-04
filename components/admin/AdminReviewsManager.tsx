"use client";
import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import * as XLSX from 'xlsx';


interface Remedy {
  id: string;
  name: string;
  slug: string;
}

interface AdminReviewsManagerProps {
  initialReviews: Review[];
  remedies: Remedy[];
  totalCount?: number;
}

interface FilterOptions {
  search: string;
  remedy: string;
  rating: string;
  dateRange: string;
  effectivenessRange: string;
  sideEffects: string;
  page: number;
}

interface ApiResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminReviewsManager({ initialReviews, remedies, totalCount }: AdminReviewsManagerProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(Math.ceil((totalCount || initialReviews.length) / 1));
  const [total, setTotal] = useState(totalCount || initialReviews.length);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    remedy: '',
    rating: '',
    dateRange: '',
    effectivenessRange: '',
    sideEffects: '',
    page: 1,
  });


  const handleExportReviews = async () => {
    try {
      setLoading(true);

      // Export currently visible reviews (filtered result)
      const rows = reviews.map((review) => {
        const userProfile = review.profiles || review.user_profile;

        return {
          User: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'Anonymous',
          Email: userProfile?.email || '',
          Remedy: getRemedyName(review.remedy_id, review),
          Rating: review.star_count,
          Effectiveness: review.effectiveness ?? '',
          Potency: review.potency ?? '',
          Dosage: review.dosage ?? '',
          Duration: review.duration_used ?? '',
          Notes: review.notes ?? '',
          Side_Effects: review.experienced_side_effects ? 'Yes' : 'No',
          Date: formatDate(review.created_at),
        };
      });

      if (rows.length === 0) {
        alert('No reviews to export');
        return;
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');

      XLSX.writeFile(
        workbook,
        `reviews_export_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export reviews');
    } finally {
      setLoading(false);
    }
  };


  // Fetch reviews with filters from API
  const fetchReviews = async (filterOptions: FilterOptions) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filterOptions.search) params.append('search', filterOptions.search);
      if (filterOptions.remedy) params.append('remedy', filterOptions.remedy);
      if (filterOptions.rating) params.append('rating', filterOptions.rating);
      if (filterOptions.effectivenessRange) params.append('effectiveness', filterOptions.effectivenessRange);
      if (filterOptions.sideEffects) params.append('sideEffects', filterOptions.sideEffects);
      if (filterOptions.dateRange) params.append('dateRange', filterOptions.dateRange);
      params.append('page', filterOptions.page.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/admin/reviews/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ApiResponse = await response.json();

      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  // Check if any filters are applied (excluding page)
  const hasFiltersApplied = (filterOptions: FilterOptions) => {
    return filterOptions.search !== '' ||
      filterOptions.remedy !== '' ||
      filterOptions.rating !== '' ||
      filterOptions.dateRange !== '' ||
      filterOptions.effectivenessRange !== '' ||
      filterOptions.sideEffects !== '';
  };

  // Apply filters with debouncing
  useEffect(() => {
    // Only fetch from API if filters are applied or page changed from 1
    if (hasFiltersApplied(filters) || filters.page > 1) {
      const timeoutId = setTimeout(() => {
        setFiltersApplied(true);
        fetchReviews(filters);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      // Use initial reviews when no filters are applied and on page 1
      if (filtersApplied) {
        setReviews(initialReviews);
        setTotal(totalCount || initialReviews.length);
        setTotalPages(Math.ceil((totalCount || initialReviews.length) / 1));
        setFiltersApplied(false);
      }
    }
  }, [filters, initialReviews, filtersApplied, totalCount]);

  const handleEditReview = async (reviewId: string, updatedData: Partial<Review>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      await response.json();

      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? { ...review, ...updatedData } : review
        )
      );
      setEditingReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      remedy: '',
      rating: '',
      dateRange: '',
      effectivenessRange: '',
      sideEffects: '',
      page: 1,
    });
    // Reset to initial reviews
    setReviews(initialReviews);
    setTotal(totalCount || initialReviews.length);
    setTotalPages(Math.ceil((totalCount || initialReviews.length) / 1));
    setFiltersApplied(false);
  };

  const getRemedyName = (remedyId: string, review?: Review) => {
    // First try to get from embedded remedy data
    if (review?.remedies?.name) {
      return review.remedies.name;
    }
    if (review?.remedy?.name) {
      return review.remedy.name;
    }
    // Fallback to remedies list
    const remedy = remedies.find(r => r.id === remedyId);
    return remedy?.name || 'Unknown Remedy';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and moderate user reviews ({reviews.length} of {total})
          </p>
        </div>

        <button
          onClick={handleExportReviews}
          disabled={loading || reviews.length === 0}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          Export XLSX
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            disabled={loading}
            className="text-sm text-[#6B7B5E] hover:text-[#5a6b4f] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="User, notes, potency..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                disabled={loading}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
              />
              {loading && filters.search && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6B7B5E]"></div>
                </div>
              )}
            </div>
          </div>

          {/* Remedy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remedy
            </label>
            <select
              value={filters.remedy}
              onChange={(e) => setFilters(prev => ({ ...prev, remedy: e.target.value, page: 1 }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
            >
              <option value="">All Remedies</option>
              {remedies.map(remedy => (
                <option key={remedy.id} value={remedy.id}>
                  {remedy.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>
                  {rating} Stars
                </option>
              ))}
            </select>
          </div>

          {/* Effectiveness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effectiveness
            </label>
            <select
              value={filters.effectivenessRange}
              onChange={(e) => setFilters(prev => ({ ...prev, effectivenessRange: e.target.value, page: 1 }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
            >
              <option value="">All Effectiveness</option>
              <option value="5">Completely resolved symptoms</option>
              <option value="4">Significantly improved</option>
              <option value="3">Moderately improved</option>
              <option value="2">Slightly improved</option>
              <option value="1">No change</option>
              <option value="0">Symptoms worsened</option>
            </select>
          </div>

          {/* Side Effects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Side Effects
            </label>
            <select
              value={filters.sideEffects}
              onChange={(e) => setFilters(prev => ({ ...prev, sideEffects: e.target.value, page: 1 }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
            >
              <option value="">All</option>
              <option value="yes">With Side Effects</option>
              <option value="no">No Side Effects</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value, page: 1 }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-500"
            >
              <option value="">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7B5E]"></div>
              <p className="mt-2 text-sm text-gray-600">Searching reviews...</p>
            </div>
          </div>
        )}

        <div className={`overflow-x-auto ${loading ? 'opacity-50' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remedy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating & Effectiveness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review: Review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  remedyName={getRemedyName(review.remedy_id, review)}
                  isEditing={editingReview === review.id}
                  onEdit={(updatedData) => handleEditReview(review.id, updatedData)}
                  onDelete={() => handleDeleteReview(review.id)}
                  onStartEdit={() => setEditingReview(review.id)}
                  onCancelEdit={() => setEditingReview(null)}
                  formatDate={formatDate}
                  renderStars={renderStars}
                  loading={loading}
                />
              ))}
            </tbody>
          </table>

          {reviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">
                {reviews.length === 0
                  ? "No reviews have been submitted yet."
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={filters.page === 1 || loading}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                  disabled={filters.page === totalPages || loading}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{filters.page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span> ({total} total reviews)
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={filters.page === 1 || loading}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    {(() => {
                      const currentPage = filters.page;
                      const pages = [];
                      const maxVisiblePages = 5;

                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                      // Adjust start if we're near the end
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }

                      // Add first page and ellipsis if needed
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                            disabled={loading}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            1
                          </button>
                        );

                        if (startPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                              ...
                            </span>
                          );
                        }
                      }

                      // Add visible page numbers
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setFilters(prev => ({ ...prev, page: i }))}
                            disabled={loading}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${currentPage === i
                              ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}

                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      disabled={filters.page === totalPages || loading}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Separate component for individual review row to avoid re-rendering issues
interface ReviewRowProps {
  review: Review;
  remedyName: string;
  isEditing: boolean;
  onEdit: (updatedData: Partial<Review>) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  formatDate: (date: string) => string;
  renderStars: (rating: number) => React.ReactElement[];
  loading: boolean;
}

function ReviewRow({
  review,
  remedyName,
  isEditing,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
  formatDate,
  renderStars,
  loading
}: ReviewRowProps) {
  const [editData, setEditData] = useState({
    star_count: review.star_count,
    effectiveness: review.effectiveness || 1,
    potency: review.potency || '',
    dosage: review.dosage || '',
    duration_used: review.duration_used || '',
    notes: review.notes || '',
  });

  const handleSave = () => {
    onEdit(editData);
  };

  const handleCancel = () => {
    setEditData({
      star_count: review.star_count,
      effectiveness: review.effectiveness || 1,
      potency: review.potency || '',
      dosage: review.dosage || '',
      duration_used: review.duration_used || '',
      notes: review.notes || '',
    });
    onCancelEdit();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {(() => {
              const userProfile = review.profiles || review.user_profile;
              return `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'Anonymous';
            })()}
          </div>
          <div className="text-sm text-gray-500">
            {(review.profiles || review.user_profile)?.email || 'No email'}
          </div>
          {isEditing ? (
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none text-gray-500"
              rows={2}
              placeholder="Review notes..."
            />
          ) : (
            review.notes && (
              <div className="text-sm text-gray-600 mt-1 max-w-xs truncate">
                {review.notes}
              </div>
            )
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{remedyName}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <select
                value={editData.star_count}
                onChange={(e) => setEditData(prev => ({ ...prev, star_count: parseInt(e.target.value) }))}
                className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>{rating} Stars</option>
                ))}
              </select>
              <select
                value={editData.effectiveness}
                onChange={(e) => setEditData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) }))}
                className="text-sm border border-gray-300 rounded px-2 py-1 ml-2 text-gray-700"
              >
                {[1, 2, 3, 4, 5].map(eff => (
                  <option key={eff} value={eff}>Eff: {eff}/5</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <div className="flex text-lg">{renderStars(review.star_count)}</div>
              {review.effectiveness && (
                <div className="text-sm text-gray-600">
                  Effectiveness: {review.effectiveness}/5
                </div>
              )}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <div className="space-y-2 max-w-xs">
            <input
              type="text"
              placeholder="Potency"
              value={editData.potency}
              onChange={(e) => setEditData(prev => ({ ...prev, potency: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
            />
            <input
              type="text"
              placeholder="Dosage"
              value={editData.dosage}
              onChange={(e) => setEditData(prev => ({ ...prev, dosage: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
            />
            <input
              type="text"
              placeholder="Duration"
              value={editData.duration_used}
              onChange={(e) => setEditData(prev => ({ ...prev, duration_used: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
            />
          </div>
        ) : (
          <div className="text-sm space-y-1 max-w-xs text-gray-500">
            {review.potency && <div><span className="font-medium">Potency:</span> {review.potency}</div>}
            {review.dosage && <div><span className="font-medium">Dosage:</span> {review.dosage}</div>}
            {review.duration_used && <div><span className="font-medium">Duration:</span> {review.duration_used}</div>}
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(review.created_at)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
            >
              ✅ Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              ❌ Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onStartEdit}
              className="text-blue-600 hover:text-blue-900"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-900"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}