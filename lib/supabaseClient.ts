import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Client for use in Client Components (browser-side)
// createBrowserClient from @supabase/ssr handles both cookies and localStorage automatically
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Export for backward compatibility
export default supabase;