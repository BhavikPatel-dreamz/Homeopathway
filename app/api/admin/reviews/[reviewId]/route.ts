import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewId = params.reviewId;
    const body = await request.json();

    const {
      star_count,
      effectiveness,
      potency,
      dosage,
      duration_used,
      notes,
      experienced_side_effects
    } = body;

    // Validate star_count if provided
    if (star_count !== undefined && (star_count < 1 || star_count > 5)) {
      return NextResponse.json(
        { error: 'Star count must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate effectiveness if provided
    if (effectiveness !== undefined && (effectiveness < 1 || effectiveness > 5)) {
      return NextResponse.json(
        { error: 'Effectiveness must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Update the review
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...(star_count !== undefined && { star_count }),
        ...(effectiveness !== undefined && { effectiveness }),
        ...(potency !== undefined && { potency }),
        ...(dosage !== undefined && { dosage }),
        ...(duration_used !== undefined && { duration_used }),
        ...(notes !== undefined && { notes }),
        ...(experienced_side_effects !== undefined && { experienced_side_effects }),
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      data
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewId = params.reviewId;

    // Delete the review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}