import { supabase } from './supabaseClient';

export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user_first_name?: string;
  user_last_name?: string;
  user_name?: string;
  user_profile_img?: string;
}

export interface ReviewInteractionCounts {
  likes: number;
  comments: number;
  userHasLiked: boolean;
}

// Like Functions
export async function toggleReviewLike(reviewId: string): Promise<{ success: boolean; userHasLiked: boolean; totalLikes: number; error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, userHasLiked: false, totalLikes: 0, error: 'User not authenticated' };
    }

    // Check if user has already liked this review
    const { data: existingLike, error: checkError } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike: Remove the like
      const { error: deleteError } = await supabase
        .from('review_likes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Get updated like count
      const { data: likeCount, error: countError } = await supabase
        .rpc('get_review_like_count', { review_id: reviewId });

      if (countError) throw countError;

      return { success: true, userHasLiked: false, totalLikes: likeCount || 0 };
    } else {
      // Like: Add the like
      const { error: insertError } = await supabase
        .from('review_likes')
        .insert([{ review_id: reviewId, user_id: user.id }]);

      if (insertError) throw insertError;

      // Get updated like count
      const { data: likeCount, error: countError } = await supabase
        .rpc('get_review_like_count', { review_id: reviewId });

      if (countError) throw countError;

      return { success: true, userHasLiked: true, totalLikes: likeCount || 0 };
    }
  } catch (error: any) {
    console.error('Error toggling review like:', error);
    return { success: false, userHasLiked: false, totalLikes: 0, error: error.message };
  }
}

export async function getReviewInteractionCounts(reviewId: string): Promise<ReviewInteractionCounts> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Get like count
    const { data: likeCount, error: likeCountError } = await supabase
      .rpc('get_review_like_count', { review_id: reviewId });

    if (likeCountError) {
      console.error('Error getting like count:', likeCountError);
    }

    // Get comment count
    const { data: commentCount, error: commentCountError } = await supabase
      .rpc('get_review_comment_count', { review_id: reviewId });

    if (commentCountError) {
      console.error('Error getting comment count:', commentCountError);
    }

    // Check if current user has liked this review
    let userHasLiked = false;
    if (user) {
      const { data: userLike, error: userLikeError } = await supabase
        .rpc('user_has_liked_review', { review_id: reviewId, user_id: user.id });

      if (!userLikeError) {
        userHasLiked = userLike || false;
      }
    }

    return {
      likes: likeCount || 0,
      comments: commentCount || 0,
      userHasLiked
    };
  } catch (error) {
    console.error('Error getting review interaction counts:', error);
    return { likes: 0, comments: 0, userHasLiked: false };
  }
}

// Comment Functions
export async function addReviewComment(reviewId: string, content: string, parentCommentId?: string): Promise<{ success: boolean; comment?: ReviewComment; error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: comment, error: insertError } = await supabase
      .from('review_comments')
      .insert([{
        review_id: reviewId,
        user_id: user.id,
        parent_comment_id: parentCommentId || null,
        content: content.trim()
      }])
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          user_name,
          profile_img
        )
      `)
      .single();

    if (insertError) throw insertError;

    return { success: true, comment: comment as ReviewComment };
  } catch (error: any) {
    console.error('Error adding review comment:', error);
    return { success: false, error: error.message };
  }
}

export async function getReviewComments(reviewId: string): Promise<{ success: boolean; comments?: ReviewComment[]; error?: string }> {
  try {
    const { data: comments, error } = await supabase
      .rpc('get_review_comments_with_profiles', { review_id: reviewId });

    if (error) throw error;

    return { success: true, comments: comments || [] };
  } catch (error: any) {
    console.error('Error getting review comments:', error);
    return { success: false, error: error.message };
  }
}

export async function updateReviewComment(commentId: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error: updateError } = await supabase
      .from('review_comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .eq('user_id', user.id); // Ensure user can only update their own comments

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating review comment:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteReviewComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error: deleteError } = await supabase
      .from('review_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id); // Ensure user can only delete their own comments

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting review comment:', error);
    return { success: false, error: error.message };
  }
}