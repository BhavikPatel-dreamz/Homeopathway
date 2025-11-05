import { supabase } from './supabaseClient';
import type { Review } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Adds a new review for a remedy to the 'reviews' table.
 *
 * @param {object} reviewData - The data for the new review.
 * @param {string} reviewData.remedyId - The ID of the remedy being reviewed.
 * @param {number} reviewData.starCount - The star rating for the review (1-5).
 * @param {string} [reviewData.potency] - The potency used (e.g., "6C", "30C", "200C").
 * @param {string} [reviewData.potency2] - Secondary potency if applicable.
 * @param {string} [reviewData.dosage] - The dosage taken (e.g., "3 pellets, 3 times daily").
 * @param {string} [reviewData.durationUsed] - How long it was used (e.g., "2 weeks").
 * @param {number} [reviewData.effectiveness] - Effectiveness rating (1-5).
 * @param {string} [reviewData.notes] - Additional notes about the experience.
 * @param {boolean} [reviewData.experiencedSideEffects] - Whether side effects were experienced.
 * @param {SupabaseClient} [reviewData.supabaseClient] - Optional Supabase client (for server-side usage).
 * @returns {Promise<{ data: Review | null; error: Error | null }>} The result of the insert operation.
 */
export async function addReview({
  remedyId,
  starCount,
  potency,
  potency2,
  dosage,
  durationUsed,
  effectiveness,
  notes,
  experiencedSideEffects = false,
  supabaseClient,
}: {
  remedyId: string;
  starCount: number;
  potency?: string;
  potency2?: string;
  dosage?: string;
  durationUsed?: string;
  effectiveness?: number;
  notes?: string;
  experiencedSideEffects?: boolean;
  supabaseClient?: SupabaseClient;
}): Promise<{ data: Review | null; error: Error | null; }> {
  // Use provided client or fall back to default browser client
  const client = supabaseClient || supabase;
  
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await client
    .from('reviews')
    .insert({
      remedy_id: remedyId,
      user_id: user.id,
      star_count: starCount,
      potency: potency || null,
      potency_2: potency2 || null,
      dosage: dosage || null,
      duration_used: durationUsed || null,
      effectiveness: effectiveness || null,
      notes: notes || null,
      experienced_side_effects: experiencedSideEffects,
    })
    .select()
    .single();

  if (error) {
    return { data, error };
  }

  // Update the remedy's average_rating and review_count
  try {
    // Get all reviews for this remedy to calculate the new average
    const { data: allReviews, error: reviewsError } = await client
      .from('reviews')
      .select('star_count')
      .eq('remedy_id', remedyId);

    if (reviewsError) {
      console.error('Error fetching reviews for average calculation:', reviewsError);
      // Don't fail the entire operation, just log the error
    } else if (allReviews) {
      const reviewCount = allReviews.length;
      const totalStars = allReviews.reduce((sum, review) => sum + review.star_count, 0);
      const averageRating = totalStars / reviewCount;

      // Update the remedy table
      const { error: updateError } = await client
        .from('remedies')
        .update({
          average_rating: averageRating,
          review_count: reviewCount,
        })
        .eq('id', remedyId);

      if (updateError) {
        console.error('Error updating remedy statistics:', updateError);
        // Don't fail the entire operation, just log the error
      }
    }
  } catch (updateError) {
    console.error('Error in remedy statistics update:', updateError);
    // Don't fail the entire operation, just log the error
  }

  return { data, error };
}

/**
 * Fetches a list of reviews, optionally filtered and sorted.
 *
 * @param {object} params - The parameters for fetching reviews.
 * @param {string} [params.remedyId] - The ID of the remedy to fetch reviews for.
 * @param {'newest' | 'oldest' | 'highest_rated' | 'lowest_rated'} [params.sortBy='newest'] - The sorting order for the reviews.
 * @param {number} [params.limit=10] - The maximum number of reviews to return.
 * @param {number[]} [params.starCount] - An array of star ratings to filter by (e.g., [4, 5]).
 * @param {string[]} [params.potency] - An array of potencies to filter by (e.g., ["30C", "200C"]).
 * @param {boolean} [params.experiencedSideEffects] - Filter by whether side effects were experienced.
 * @returns {Promise<{ data: Review[] | null; error: Error | null }>} A list of reviews with associated user profiles, or an error.
 */
export async function getReviews({
  remedyId,
  sortBy = 'newest',
  limit = 10,
  starCount,
  potency,
  searchQuery,
  experiencedSideEffects,
}: {
  remedyId?: string;
  sortBy?: 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated';
  limit?: number;
  starCount?: number[];
  potency?: string[];
  searchQuery?: string;
  experiencedSideEffects?: boolean;
}): Promise<{ data: Review[] | null; error: Error | null; }> {
  let query = supabase
    .from('reviews')
    .select('*')
    .limit(limit);
  if (remedyId) {
    query = query.eq('remedy_id', remedyId);
  }

  if (starCount && starCount.length > 0) {
    query = query.in('star_count', starCount);
  }

  if (potency && potency.length > 0) {
    query = query.in('potency', potency);
  }

  if (experiencedSideEffects !== undefined) {
    query = query.eq('experienced_side_effects', experiencedSideEffects);
  }

  if (searchQuery) {
    const searchString = `%${searchQuery}%`;
    query = query.or(`notes.ilike.${searchString},potency.ilike.${searchString},dosage.ilike.${searchString}`);
  }

  // Apply sorting
  switch (sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest_rated':
      query = query.order('star_count', { ascending: false });
      break;
    case 'lowest_rated':
      query = query.order('star_count', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data: reviews, error } = await query;

  if (error) {
    return { data: null, error };
  }

  if (!reviews || reviews.length === 0) {
    return { data: [], error: null };
  }

  // Manually fetch profile data for the reviews
  const userIds = reviews.map(review => review.user_id).filter(Boolean);
  
  if (userIds.length === 0) {
    // No user IDs to fetch profiles for
    return { 
      data: reviews.map(review => ({ ...review, profiles: null })), 
      error: null 
    };
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  if (profileError) {
    // If we can't fetch profiles, still return reviews but without profile data
    console.warn('Could not fetch profiles:', profileError);
    return { 
      data: reviews.map(review => ({ ...review, profiles: null })), 
      error: null 
    };
  }

  // Join the profile data with reviews
  const reviewsWithProfiles = reviews.map(review => ({
    ...review,
    profiles: profiles?.find(profile => profile.id === review.user_id) || null
  }));

  return { data: reviewsWithProfiles, error: null };
}

/**
 * Fetches unique filter options (like potency and form) for reviews of a specific remedy.
 *
 * @param {string} remedyId - The ID of the remedy to get filter options for.
 * @returns {Promise<{ data: { potencies: string[]; forms: string[] } | null; error: Error | null }>}
 */
export async function getReviewFilterOptions(remedyId: string): Promise<{
  data: { potencies: string[]; forms: string[] } | null;
  error: Error | null;
}> {
  try {
    // Using rpc call to a function that gets distinct values would be more efficient.
    // As a fallback, we can fetch all and process in JS, but this is not scalable.
    const { data, error } = await supabase
      .from('reviews')
      .select('potency, dosage') // Assuming 'dosage' might contain form info like 'pellets'
      .eq('remedy_id', remedyId);

    if (error) {
      throw error;
    }

    if (!data) {
      return { data: { potencies: [], forms: [] }, error: null };
    }

    const potencies = [...new Set(data.map(r => r.potency).filter(Boolean) as string[])].sort();
    
    // This is a guess. The 'form' might be part of 'dosage' or another column.
    // For now, I'll extract from dosage. A dedicated 'form' column is better.
    const forms = [...new Set(data.map(r => r.dosage).filter(Boolean) as string[])].sort();

    return { data: { potencies, forms }, error: null };
  } catch (error) {
    console.error('Error fetching review filter options:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Fetches a single review by its ID.
 *
 * @param {string} reviewId - The UUID of the review to fetch.
 * @returns {Promise<{ data: Review | null; error: Error | null }>} The review object or an error.
 */
export async function getReviewById(reviewId: string): Promise<{ data: Review | null; error: Error | null; }> {
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error) {
    return { data: null, error };
  }

  if (!review) {
    return { data: null, error: null };
  }

  // Fetch profile data if user_id exists
  if (review.user_id) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', review.user_id)
      .single();

    if (profileError) {
      console.warn('Could not fetch profile for review:', profileError);
      return { data: { ...review, profiles: null }, error: null };
    }

    return { data: { ...review, profiles: profile }, error: null };
  }

  return { data: { ...review, profiles: null }, error: null };
}

/**
 * Updates an existing review.
 *
 * @param {string} reviewId - The ID of the review to update.
 * @param {object} updateData - The data to update.
 * @returns {Promise<{ data: Review | null; error: Error | null }>} The updated review or an error.
 */
export async function updateReview(
  reviewId: string,
  updateData: Partial<Omit<Review, 'id' | 'remedy_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Review | null; error: Error | null; }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({
      star_count: updateData.star_count,
      potency: updateData.potency || null,
      potency_2: updateData.potency_2 || null,
      dosage: updateData.dosage || null,
      duration_used: updateData.duration_used || null,
      effectiveness: updateData.effectiveness || null,
      notes: updateData.notes || null,
      experienced_side_effects: updateData.experienced_side_effects || false,
    })
    .eq('id', reviewId)
    .eq('user_id', user.id) // Ensure user can only update their own reviews
    .select()
    .single();

  return { data, error };
}

/**
 * Deletes a review by its ID.
 *
 * @param {string} reviewId - The ID of the review to delete.
 * @returns {Promise<{ data: null; error: Error | null }>} Success or error.
 */
export async function deleteReview(reviewId: string): Promise<{ data: null; error: Error | null; }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id); // Ensure user can only delete their own reviews

  return { data: null, error };
}

/**
 * Gets review statistics for a remedy.
 *
 * @param {string} remedyId - The ID of the remedy.
 * @returns {Promise<{ data: { average_rating: number; total_reviews: number; rating_distribution: Record<number, number> } | null; error: Error | null }>}
 */
export async function getReviewStats(remedyId: string): Promise<{
  data: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  } | null;
  error: Error | null;
}> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('star_count')
    .eq('remedy_id', remedyId);

  if (error) {
    return { data: null, error };
  }

  if (!reviews || reviews.length === 0) {
    return {
      data: {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      error: null,
    };
  }

  const totalReviews = reviews.length;
  const sumRatings = reviews.reduce((sum, review) => sum + review.star_count, 0);
  const averageRating = sumRatings / totalReviews;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    ratingDistribution[review.star_count as keyof typeof ratingDistribution]++;
  });

  return {
    data: {
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      total_reviews: totalReviews,
      rating_distribution: ratingDistribution,
    },
    error: null,
  };
}

/**
 * Fetches counts of various entities for a dashboard overview.
 *
 * @returns {Promise<{ data: { totalReviews: number; totalRemedies: number; totalUsers: number } | null; error: Error | null }>}
 *          An object containing the counts or an error.
 */
export async function getDashboardCounts(): Promise<{
  data: { totalReviews: number; totalRemedies: number; totalUsers: number,totalAilment:number } | null;
  error: Error | null;
}> {
  try {
    // Fetch total reviews count
    const { count: totalReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    if (reviewsError) {
      console.error('Error fetching total reviews:', reviewsError);
      return { data: null, error: reviewsError };
    }

    // Fetch total remedies count
    const { count: totalRemedies, error: remediesError } = await supabase
      .from('remedies') // Corrected table name from 'remides'
      .select('*', { count: 'exact', head: true });

    if (remediesError) {
      console.error('Error fetching total remedies:', remediesError);
      return { data: null, error: remediesError };
    }
     const { count: totalAilment, error: ailmentError } = await supabase
      .from('ailments') // Corrected table name from 'remides'
      .select('*', { count: 'exact', head: true });

    if (ailmentError) {
      console.error('Error fetching total remedies:', remediesError);
      return { data: null, error: remediesError };
    }

    // Fetch total profiles (users) count
    const { count: totalUsers, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) {
      console.error('Error fetching total users:', profilesError);
      return { data: null, error: profilesError };
    }

    return { data: { totalReviews: totalReviews || 0, totalRemedies: totalRemedies || 0, totalUsers: totalUsers || 0 ,totalAilment:totalAilment||0}, error: null };
  } catch (error) {
    console.error('Error in getDashboardCounts:', error);
    return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
  }
}
