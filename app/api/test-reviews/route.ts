import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test the relationship between reviews and profiles
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        star_count,
        notes,
        user_id,
        profiles!inner(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      data,
      count: data?.length || 0,
      message: 'Success - relationship working' 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}