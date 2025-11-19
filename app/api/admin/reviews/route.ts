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
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('reviews')
      .select(`
        *,
        remedies(id, name, slug),
        profiles(id, first_name, last_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (remedy) {
      query = query.eq('remedy_id', remedy);
    }

    if (rating) {
      query = query.eq('star_count', parseInt(rating));
    }

    if (effectiveness) {
      query = query.eq('effectiveness', parseInt(effectiveness));
    }

    if (sideEffects === 'yes') {
      query = query.eq('experienced_side_effects', true);
    } else if (sideEffects === 'no') {
      query = query.eq('experienced_side_effects', false);
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      const daysAgo = parseInt(dateRange);
      const cutoff = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      query = query.gte('created_at', cutoff.toISOString());
    }

    // Text search filter (will be applied on the backend)
    if (search) {
      // Use ilike for case-insensitive search on notes, potency, dosage
      query = query.or(`notes.ilike.%${search}%,potency.ilike.%${search}%,dosage.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data: reviews, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch reviews',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      reviews: reviews || [], 
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error:any) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}