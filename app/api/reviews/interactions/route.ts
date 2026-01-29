import { NextRequest, NextResponse } from 'next/server';
import { getReviewInteractionCounts } from '@/lib/reviewInteractions';

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

    const counts = await getReviewInteractionCounts(reviewId);

    return NextResponse.json({
      success: true,
      ...counts
    });
  } catch (error: any) {
    console.error('Error getting interaction counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}