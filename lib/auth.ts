/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabaseClient';

// Light wrappers around Supabase auth and profile operations.
// These are intentionally small and documented so you can adapt them
// to your Supabase schema and RLS policies.

export async function signUpWithEmail({ email, password, firstName, lastName }: { email: string; password: string; firstName?: string; lastName?: string }) {
  // Use a server-side admin route to create the user without sending
  // a confirmation email. The server route will also create the profile
  // row using the service role key.
  try {
    const res = await fetch('/api/auth/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = json?.error?.message || json?.error || 'Signup failed';
      return { error: new Error(message) };
    }

    // Return the created user object under `data.user` to match previous shape
    return { data: { user: json.user }, error: null };
  } catch (err) {
    return { error: new Error(String(err)) };
  }
}

export async function signInWithEmail({ email, password }: { email: string; password: string }) {
  // @supabase/ssr automatically handles session persistence in cookies
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : undefined;
  
  return supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export async function getUserProfile(userId?: string) {
  // If no userId provided, try to get the currently logged-in user
  let userEmail: string | undefined;
  
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
    userEmail = user?.email;
    
    console.log('👤 Current user from auth:', { id: userId, email: userEmail });
  }

  if (!userId) {
    console.log('⚠️ No userId provided to getUserProfile');
    return { profile: null, error: null };
  }

  // Try to get profile - using single() instead of maybeSingle() for better error handling
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  

  // If there's an error (like infinite recursion or permission denied), return it
  if (error) {
    console.error('❌ Error fetching profile:', error);
    
    // If it's a "not found" error, try to create the profile
    if (error.code === 'PGRST116') {
      console.log('🔧 Profile not found, attempting to create...');
      
      // We should have userEmail from above
      if (!userEmail) {
        console.log('📧 Fetching user email again...');
        const { data: { user } } = await supabase.auth.getUser();
        userEmail = user?.email;
        console.log('📧 User email:', userEmail);
      }
      
      if (userEmail) {
        console.log('💾 Inserting new profile:', { id: userId, email: userEmail });
        
        // Use upsert to make profile creation idempotent and avoid
        // duplicate-key errors when multiple requests race to create the same profile.
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: userEmail,
            first_name: 'User',
            last_name: 'Name',
            role: 'user'
          }, { onConflict: 'id' })
          .select()
          .single();

        console.log('💾 Upsert result - data:', newProfile, 'error:', createError);

        if (createError) {
          // If we still receive a duplicate-key error, fetch the existing profile
          // and return it rather than failing the whole flow.
          if ((createError as any)?.code === '23505') {
            console.warn('↪️ Duplicate profile detected after upsert; fetching existing profile');
            const { data: existing, error: fetchErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            if (fetchErr) {
              console.error('❌ Failed to fetch existing profile after duplicate error:', fetchErr);
              return { profile: null, error: fetchErr };
            }
            return { profile: existing, error: null };
          }

          console.error('❌ Failed to create or upsert profile:', createError);
          return { profile: null, error: createError };
        }

        console.log('✅ Profile created/upserted successfully:', newProfile);
        return { profile: newProfile, error: null };
      } else {
        console.error('❌ No email available to create profile');
      }
    }
    
    return { profile: null, error };
  }
  
  
  return { profile: data, error: null };
}

// Server-side helper for checking if a user is admin.
// This reads the profiles table and expects a `role` column with values 'user' or 'admin'.
export async function isAdmin(userId?: string) {
  const { profile, error } = await getUserProfile(userId);
  if (error) return false;
  // Treat 'moderator' as privileged for accessing admin area
  return profile?.role === 'admin' || profile?.role === 'moderator';
}

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getUserProfile,
  isAdmin,
};
