import { supabase } from './supabaseClient';

/**
 * Adds a new review for a remedy to the 'reviews' table.
 * Assumes you have a `reviews` table with the specified columns.
 *
 * @param {object} reviewData - The data for the new review.
 * @param {string} reviewData.remedyId - The ID of the remedy being reviewed.
 * @param {string} reviewData.userId - The ID of the user submitting the review.
 * @param {number} reviewData.rating - The star rating for the review (e.g., 1-5).
 * @param {string} [reviewData.dosageUsed] - The dosage the user took (e.g., "30C").
 * @param {string} [reviewData.formUsed] - The form of the remedy used (e.g., "Pellets").
 * @param {string} reviewData.reviewText - The text content of the review.
 * @returns {Promise<{ data: any; error: Error | null }>} The result of the insert operation.
 */
export async function addReview({
  remedyId,
  rating,
  dosageUsed,
  formUsed,
  reviewText,
}: {
  remedyId: string;
  userId: string;
  rating: number;
  dosageUsed?: string;
  formUsed?: string;
  reviewText: string;
}): Promise<{ data: any; error: Error | null; }> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      remedy_id: remedyId,
      user_id: user?.id,
      rating,
      dosage_used: dosageUsed ?? null,
      form_used: formUsed ?? null,
      review_text: reviewText,
      helpful_count: 0, // Initialize helpful count to 0
    });

  return { data, error };
}

/**
 * Fetches a list of reviews, optionally filtered and sorted.
 *
 * @param {object} params - The parameters for fetching reviews.
 * @param {string} [params.remedyId] - The ID of the remedy to fetch reviews for.
 * @param {'newest' | 'helpful'} [params.sortBy='newest'] - The sorting order for the reviews.
 * @param {number} [params.limit=10] - The maximum number of reviews to return.
 * @returns {Promise<{ data: any[] | null; error: Error | null }>} A list of reviews with associated user profiles, or an error.
 */
export async function getReviews({
  remedyId,
  sortBy = 'newest',
  limit = 10,
}: {
  remedyId?: string;
  sortBy?: 'newest' | 'helpful';
  limit?: number;
}): Promise<{ data: any[] | null; error: Error | null; }> {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      )
    `)
    .limit(limit);

  if (remedyId) {
    query = query.eq('remedy_id', remedyId);
  }

  if (sortBy === 'helpful') {
    query = query.order('helpful_count', { ascending: false });
  } else { // 'newest' is the default
    query = query.order('created_at', { ascending: false });
  }

  return query;
}

/**
 * Fetches a single review by its ID.
 *
 * @param {string} reviewId - The UUID of the review to fetch.
 * @returns {Promise<{ data: any; error: Error | null }>} The review object or an error.
 */
export async function getReviewById(reviewId: string): Promise<{ data: any; error: Error | null; }> {
  return supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();
}