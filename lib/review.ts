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
  ailmentId,
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
  ailmentId?: string;
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
      ailment_id: ailmentId || null,
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
 * Fetches a list of reviews with proper AND logic for remedy + ailment filtering.
 *
 * @param {object} params - The parameters for fetching reviews.
 * @param {string} [params.remedyId] - The ID of the remedy to fetch reviews for.
 * @param {string} [params.ailmentId] - The ID of the ailment to filter by.
 * @param {'newest' | 'oldest' | 'highest_rated' | 'lowest_rated'} [params.sortBy='newest'] - The sorting order.
 * @param {number} [params.limit=10] - The maximum number of reviews to return.
 * @param {number[]} [params.starCount] - Star ratings to filter by (e.g., [4, 5]).
 * @param {string[]} [params.potency] - Potencies to filter by (e.g., ["30C", "200C"]).
 *  * @param {string[]} [params.dosage] 
 * @param {string} [params.searchQuery] - Search query to filter notes, potency, or dosage.
 * @param {boolean} [params.experiencedSideEffects] - Filter by side effects.
 * 
 * @returns {Promise<{ data: Review[] | null; error: Error | null }>} Reviews with associated profiles.
 */


export async function getReviews({
  remedyId,
  ailmentId,
  sortBy = 'newest',
  limit = 10,
  starCount,
  potency,
  searchQuery,
  experiencedSideEffects,
  dosage
}: {
  remedyId?: string;
  ailmentId?: string | null;
  sortBy?: 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated';
  limit?: number;
  starCount?: number[];
  potency?: string[];
  searchQuery?: string;
  dosage?:string[];
  experiencedSideEffects?: boolean;
}): Promise<{ data: Review[] | null; error: Error | null }> {
  let query = supabase.from('reviews').select('*').limit(limit);

  // REMEDY FILTER
  if (remedyId) query = query.eq('remedy_id', remedyId);

  // AILMENT FILTER
  if (remedyId && ailmentId !== undefined) {
    if (ailmentId === null) query = query.is('ailment_id', null);
    else query = query.eq('ailment_id', ailmentId);
  } else if (!remedyId && ailmentId !== undefined) {
    if (ailmentId === null) query = query.is('ailment_id', null);
    else query = query.eq('ailment_id', ailmentId);
  }

  // ADDITIONAL FILTERS
  if (starCount?.length) query = query.in('star_count', starCount);
  if (potency?.length) query = query.in('potency', potency);
  if (dosage?.length) query = query.in('dosage', dosage);
  if (experiencedSideEffects !== undefined)
    query = query.eq('experienced_side_effects', experiencedSideEffects);

  // SORTING
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
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data: reviews, error } = await query;
  if (error) return { data: null, error };
  if (!reviews?.length) return { data: [], error: null };

  // FETCH PROFILES
  const userIds = reviews.map(r => r.user_id).filter(Boolean);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  if (profileError) {
    console.warn('Could not fetch profiles:', profileError);
    return {
      data: reviews.map(r => ({ ...r, profiles: null })),
      error: null,
    };
  }

  // Merge profiles
  let reviewsWithProfiles = reviews.map(r => ({
    ...r,
    profiles: profiles?.find(p => p.id === r.user_id) || null,
  }));

  // LOCAL SEARCH FILTER (no join)
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.trim().toLowerCase();
    reviewsWithProfiles = reviewsWithProfiles.filter(r => {
      const matchNotes =
        r.notes?.toLowerCase().includes(q) ||
        r.potency?.toLowerCase().includes(q) ||
        r.dosage?.toLowerCase().includes(q);
      const matchProfile =
        r.profiles &&
        ((r.profiles.first_name &&
          r.profiles.first_name.toLowerCase().includes(q)) ||
          (r.profiles.last_name &&
            r.profiles.last_name.toLowerCase().includes(q)));
             (r.profiles.id.includes(q));
      return matchNotes || matchProfile;
    });
  }

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
 * Gets average rating and review count based on remedy and/or ailment filtering.
 * 
 * Logic:
 * - Both remedyId + ailmentId: strict AND (remedy X AND ailment Y)
 * - Only remedyId: ALL reviews for that remedy (any ailment)
 * - Only ailmentId: ALL reviews for that ailment (any remedy)
 * 
 * @param {object} params - The filtering parameters
 * @param {string} [params.remedyId] - The ID of the remedy
 * @param {string} [params.ailmentId] - The ID of the ailment
 * @returns {Promise<{ data: { average_rating: number; review_count: number } | null; error: Error | null }>}
 */
export async function getRemedyAilmentStats({
  remedyId,
  ailmentId,
}: {
  remedyId?: string;
  ailmentId?: string;
}): Promise<{
  data: {
    average_rating: number;
    review_count: number;
  } | null;
  error: Error | null;
}> {
  let query = supabase
    .from('reviews')
    .select('star_count');

  // Apply filters based on what's provided
  if (remedyId && ailmentId) {
    // Both provided - strict AND logic
    query = query.eq('remedy_id', remedyId).eq('ailment_id', ailmentId);
    console.log('Filtering by remedy AND ailment:', { remedyId, ailmentId });
  } else if (remedyId) {
    // Only remedy - get ALL reviews for this remedy
    query = query.eq('remedy_id', remedyId);
    console.log('Filtering by remedy only:', remedyId);
  } else if (ailmentId) {
    // Only ailment - get ALL reviews for this ailment
    query = query.eq('ailment_id', ailmentId);
    console.log('Filtering by ailment only:', ailmentId);
  } else {
    console.log('No filters applied - fetching ALL reviews');
  }

  const { data: reviews, error } = await query;
  
  console.log(`Query returned ${reviews?.length || 0} reviews for remedyId: ${remedyId}`);

  if (error) {
    return { data: null, error };
  }

  if (!reviews || reviews.length === 0) {
    return {
      data: {
        average_rating: 0,
        review_count: 0,
      },
      error: null,
    };
  }

  const reviewCount = reviews.length;
  const totalStars = reviews.reduce((sum, review) => sum + review.star_count, 0);
  const averageRating = totalStars / reviewCount;

  return {
    data: {
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      review_count: reviewCount,
    },
    error: null,
  };
}

/**
 * Gets review statistics for a remedy with proper AND logic for ailment filtering.
 *
 * @param {string} remedyId - The ID of the remedy.
 * @param {string | null} [ailmentId] - The ID of the ailment to filter by (undefined = all reviews).
 * @returns {Promise<{ data: { average_rating: number; total_reviews: number; rating_distribution: Record<number, number> } | null; error: Error | null }>}
 */
export async function getReviewStats(remedyId: string, ailmentId?: string | null): Promise<{
  data: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  } | null;
  error: Error | null;
}> {
  let query = supabase
    .from('reviews')
    .select('star_count')
    .eq('remedy_id', remedyId);

  // AILMENT FILTER with strict AND logic (matches getReviews logic)
  if (ailmentId !== undefined) {
    if (ailmentId === null) {
      // Show only general reviews (not specific to any ailment)
      query = query.is('ailment_id', null);
    } else {
      // Show reviews ONLY for this specific ailment (strict AND logic)
      query = query.eq('ailment_id', ailmentId);
    }
  }
  // If ailmentId is undefined, show ALL reviews for the remedy (no filtering by ailment)

  const { data: reviews, error } = await query;

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
