import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const remedy = searchParams.get('remedy') || '';
    const rating = searchParams.get('rating') || '';
    const effectiveness = searchParams.get('effectiveness') || '';
    const sideEffects = searchParams.get('sideEffects') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // First, get all reviews that match non-text filters
    const reviewsData = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (reviewsData.error) {
      throw reviewsData.error;
    }

    let filteredReviews = reviewsData.data || [];

    // Apply filters
    if (remedy) {
      filteredReviews = filteredReviews.filter(review => review.remedy_id === remedy);
    }

    if (rating) {
      const ratingNum = parseInt(rating);
      filteredReviews = filteredReviews.filter(review => review.star_count === ratingNum);
    }

    if (effectiveness) {
      const effectivenessNum = parseInt(effectiveness);
      filteredReviews = filteredReviews.filter(review => review.effectiveness === effectivenessNum);
    }

    if (sideEffects === 'yes') {
      filteredReviews = filteredReviews.filter(review => review.experienced_side_effects === true);
    } else if (sideEffects === 'no') {
      filteredReviews = filteredReviews.filter(review => review.experienced_side_effects === false);
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      const daysAgo = parseInt(dateRange);
      const cutoff = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filteredReviews = filteredReviews.filter(review => 
        new Date(review.created_at) >= cutoff
      );
    }

    // Get unique user IDs and remedy IDs for batch fetching
    const userIds = [...new Set(filteredReviews.map(r => r.user_id).filter(Boolean))];
    const remedyIds = [...new Set(filteredReviews.map(r => r.remedy_id))];

    // Fetch related data
    const [profilesResult, remediesResult] = await Promise.all([
      userIds.length > 0 ? supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds) : { data: [] },
      supabase
        .from('remedies')
        .select('id, name, slug')
        .in('id', remedyIds)
    ]);

    const profiles = profilesResult.data || [];
    const remedies = remediesResult.data || [];

    // Join the data and apply text search
    let reviewsWithProfiles = filteredReviews.map(review => ({
      ...review,
      profiles: profiles.find(p => p.id === review.user_id) || null,
      remedies: remedies.find(r => r.id === review.remedy_id) || null
    }));

    // Apply text search filter
    if (search) {
      const searchLower = search.toLowerCase();
      reviewsWithProfiles = reviewsWithProfiles.filter(review => {
        const userProfile = review.profiles;
        return (
          (userProfile?.first_name?.toLowerCase().includes(searchLower)) ||
          (userProfile?.last_name?.toLowerCase().includes(searchLower)) ||
          (userProfile?.email?.toLowerCase().includes(searchLower)) ||
          (review.notes?.toLowerCase().includes(searchLower)) ||
          (review.potency?.toLowerCase().includes(searchLower)) ||
          (review.dosage?.toLowerCase().includes(searchLower)) ||
          (review.remedies?.name?.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply pagination
    const total = reviewsWithProfiles.length;
    const offset = (page - 1) * limit;
    const paginatedReviews = reviewsWithProfiles.slice(offset, offset + limit);

    return NextResponse.json({ 
      reviews: paginatedReviews, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}