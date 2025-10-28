import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for use in Client Components (browser-side)
// createBrowserClient from @supabase/ssr handles both cookies and localStorage automatically
// Cookies are used for server-side, localStorage as fallback for client-side
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Export for backward compatibility
export default supabase;