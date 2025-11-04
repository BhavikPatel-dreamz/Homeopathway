"use client";
import React, { useState, useEffect } from 'react';
import { Review } from '@/types';

interface Remedy {
  id: string;
  name: string;
  slug: string;
}

interface AdminReviewsManagerProps {
  initialReviews: Review[];
  remedies: Remedy[];
}

interface FilterOptions {
  search: string;
  remedy: string;
  rating: string;
  dateRange: string;
  effectivenessRange: string;
  sideEffects: string;
}

export default function AdminReviewsManager({ initialReviews, remedies }: AdminReviewsManagerProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(initialReviews);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    remedy: '',
    rating: '',
    dateRange: '',
    effectivenessRange: '',
    sideEffects: '',
  });

  // Apply filters
  useEffect(() => {
    let filtered = reviews;

    // Search filter (user name, notes, potency, dosage)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(review => {
        const userProfile = review.profiles || review.user_profile;
        return (
          (userProfile?.first_name?.toLowerCase().includes(searchLower)) ||
          (userProfile?.last_name?.toLowerCase().includes(searchLower)) ||
          (userProfile?.email?.toLowerCase().includes(searchLower)) ||
          (review.notes?.toLowerCase().includes(searchLower)) ||
          (review.potency?.toLowerCase().includes(searchLower)) ||
          (review.dosage?.toLowerCase().includes(searchLower))
        );
      });
    }

    // Remedy filter
    if (filters.remedy) {
      filtered = filtered.filter(review => review.remedy_id === filters.remedy);
    }

    // Rating filter
    if (filters.rating) {
      const rating = parseInt(filters.rating);
      filtered = filtered.filter(review => review.star_count === rating);
    }

    // Effectiveness filter
    if (filters.effectivenessRange) {
      const effectiveness = parseInt(filters.effectivenessRange);
      filtered = filtered.filter(review => review.effectiveness === effectiveness);
    }

    // Side effects filter
    if (filters.sideEffects) {
      const hasSideEffects = filters.sideEffects === 'yes';
      filtered = filtered.filter(review => review.experienced_side_effects === hasSideEffects);
    }

    // Date range filter (last 30 days, 90 days, etc.)
    if (filters.dateRange) {
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange);
      const cutoff = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(review => new Date(review.created_at) >= cutoff);
    }

    setFilteredReviews(filtered);
  }, [reviews, filters]);

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
    });
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
            Manage and moderate user reviews ({filteredReviews.length} of {reviews.length})
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-[#6B7B5E] hover:text-[#5a6b4f] font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="User, notes, potency..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
            />
          </div>

          {/* Remedy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remedy
            </label>
            <select
              value={filters.remedy}
              onChange={(e) => setFilters(prev => ({ ...prev, remedy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
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
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
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
              onChange={(e) => setFilters(prev => ({ ...prev, effectivenessRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
            >
              <option value="">All Effectiveness</option>
              {[5, 4, 3, 2, 1].map(eff => (
                <option key={eff} value={eff}>
                  {eff}/5 Effective
                </option>
              ))}
            </select>
          </div>

          {/* Side Effects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Side Effects
            </label>
            <select
              value={filters.sideEffects}
              onChange={(e) => setFilters(prev => ({ ...prev, sideEffects: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
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
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent"
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
              {filteredReviews.map((review) => (
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

          {filteredReviews.length === 0 && (
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
    experienced_side_effects: review.experienced_side_effects,
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
      experienced_side_effects: review.experienced_side_effects,
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
              className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
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
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>{rating} Stars</option>
                ))}
              </select>
              <select
                value={editData.effectiveness}
                onChange={(e) => setEditData(prev => ({ ...prev, effectiveness: parseInt(e.target.value) }))}
                className="text-sm border border-gray-300 rounded px-2 py-1 ml-2"
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
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Dosage"
              value={editData.dosage}
              onChange={(e) => setEditData(prev => ({ ...prev, dosage: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Duration"
              value={editData.duration_used}
              onChange={(e) => setEditData(prev => ({ ...prev, duration_used: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            />
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={editData.experienced_side_effects}
                onChange={(e) => setEditData(prev => ({ ...prev, experienced_side_effects: e.target.checked }))}
                className="mr-2"
              />
              Side effects
            </label>
          </div>
        ) : (
          <div className="text-sm space-y-1 max-w-xs">
            {review.potency && <div><span className="font-medium">Potency:</span> {review.potency}</div>}
            {review.dosage && <div><span className="font-medium">Dosage:</span> {review.dosage}</div>}
            {review.duration_used && <div><span className="font-medium">Duration:</span> {review.duration_used}</div>}
            <div className="flex items-center gap-2">
              <span className={review.experienced_side_effects ? 'text-red-600' : 'text-green-600'}>
                {review.experienced_side_effects ? '⚠️ Side effects' : '✅ No side effects'}
              </span>
            </div>
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