import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get the user to check their role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role === 'admin') {
        // Redirect admin to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    
    // Redirect regular user to home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
