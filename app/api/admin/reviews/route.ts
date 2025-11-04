import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all reviews with related data
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        remedies(id, name, slug),
        profiles(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch reviews',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}