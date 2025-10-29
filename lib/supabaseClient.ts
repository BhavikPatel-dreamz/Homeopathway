import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only log warning during build, don't throw error
  // This allows the build to succeed even if env vars aren't available during static generation
  if (typeof window === 'undefined') {
    console.warn('Supabase environment variables not set during build');
  }
}

// Client for use in Client Components (browser-side)
// createBrowserClient from @supabase/ssr handles both cookies and localStorage automatically
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Export for backward compatibility
export default supabase;