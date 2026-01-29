import { NextRequest, NextResponse } from 'next/server';
import { toggleReviewLike } from '@/lib/reviewInteractions';

export async function POST(request: NextRequest) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const result = await toggleReviewLike(reviewId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        userHasLiked: result.userHasLiked,
        totalLikes: result.totalLikes
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}