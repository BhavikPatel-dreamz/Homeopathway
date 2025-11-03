import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addReview } from '@/lib/review';

export async function POST(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = await createClient();
    
    // Parse the request body
    const body = await request.json();
    const {
      remedy_id,
      star_count,
      potency,
      dosage,
      duration_used,
      effectiveness,
      notes,
      experienced_side_effects
    } = body;

    // Validate required fields
    if (!remedy_id || !star_count) {
      return NextResponse.json(
        { error: 'Remedy ID and rating are required' },
        { status: 400 }
      );
    }

    if (star_count < 1 || star_count > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if remedy_id is a UUID or a slug and convert if necessary
    let actualRemedyId = remedy_id;
    
    // Simple UUID validation (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(remedy_id);
    
    if (!isUUID) {
      // It's likely a slug, so look up the actual remedy ID
      const { data: remedy, error: remedyError } = await supabase
        .from('remedies')
        .select('id')
        .eq('slug', remedy_id)
        .single();

      if (remedyError || !remedy) {
        return NextResponse.json(
          { error: 'Remedy not found' },
          { status: 404 }
        );
      }

      actualRemedyId = remedy.id;
    }

    // Use the addReview function from review.ts with server-side client
    const { data, error } = await addReview({
      remedyId: actualRemedyId,
      starCount: parseInt(star_count),
      potency: potency || undefined,
      dosage: dosage || undefined,
      durationUsed: duration_used || undefined,
      effectiveness: effectiveness ? parseInt(effectiveness) : undefined,
      notes: notes || undefined,
      experiencedSideEffects: experienced_side_effects === 'Yes' || experienced_side_effects === true,
      supabaseClient: supabase, // Pass the server-side client
    });

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Review created successfully',
        data 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}