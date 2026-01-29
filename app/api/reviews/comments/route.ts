import { NextRequest, NextResponse } from 'next/server';
import { addReviewComment, getReviewComments, updateReviewComment, deleteReviewComment } from '@/lib/reviewInteractions';

// GET - Get comments for a review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const result = await getReviewComments(reviewId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        comments: result.comments
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error getting comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a new comment
export async function POST(request: NextRequest) {
  try {
    const { reviewId, content, parentCommentId } = await request.json();

    if (!reviewId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Review ID and content are required' },
        { status: 400 }
      );
    }

    const result = await addReviewComment(reviewId, content, parentCommentId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        comment: result.comment
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a comment
export async function PUT(request: NextRequest) {
  try {
    const { commentId, content } = await request.json();

    if (!commentId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Comment ID and content are required' },
        { status: 400 }
      );
    }

    const result = await updateReviewComment(commentId, content);

    if (result.success) {
      return NextResponse.json({
        success: true
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteReviewComment(commentId);

    if (result.success) {
      return NextResponse.json({
        success: true
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}