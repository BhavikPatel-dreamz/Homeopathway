// Re-export the browser Supabase client so client components use
// a single, consistent instance that handles cookies/localStorage.
import { supabase as browserSupabase } from './supabaseClient';

export const supabase = browserSupabase;

export default supabase;
