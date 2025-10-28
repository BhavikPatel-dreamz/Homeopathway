import { supabase } from './supabaseClient';

// Light wrappers around Supabase auth and profile operations.
// These are intentionally small and documented so you can adapt them
// to your Supabase schema and RLS policies.

export async function signUpWithEmail({ email, password, firstName, lastName }: { email: string; password: string; firstName?: string; lastName?: string }) {
  // 1) Sign up the user
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });
  if (error) return { error };

  // 2) If the signup succeeded and user is available, create a profile row.
  // Assumes you have a `profiles` table with columns: id (uuid same as auth user id), email, first_name, last_name, role
  try {
    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          id: user.id,
          email: user.email,
          first_name: firstName ?? null, 
          last_name: lastName ?? null, 
          role: 'user' 
        });
      
      if (profileError) {
        console.warn('Profile insert failed:', profileError);
      }
    }
  } catch (err) {
    // Non-fatal here; profile creation may be blocked by RLS depending on your setup.
    // Surface the auth result and log the profile insert error in the console.
    console.warn('profile insert failed', err);
  }

  return { data, error: null };
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
    const { data: udata } = await supabase.auth.getUser();
    userId = udata.user?.id ?? undefined;
    userEmail = udata.user?.email;
  }

  if (!userId) return { profile: null, error: null };

  // Try to get profile
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  
  // If profile doesn't exist, try to create it
  if (!data && !error) {
    console.log('🔧 Profile not found, attempting to create...');
    
    // Get user email if we don't have it
    if (!userEmail) {
      const { data: udata } = await supabase.auth.getUser();
      userEmail = udata.user?.email;
    }
    
    if (userEmail) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          first_name: 'User',
          last_name: 'Name',
          role: 'user'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create profile:', createError);
        return { profile: null, error: createError };
      }
      
      console.log('✅ Profile created successfully');
      return { profile: newProfile, error: null };
    }
  }
  
  return { profile: data, error };
}

// Server-side helper for checking if a user is admin.
// This reads the profiles table and expects a `role` column with values 'user' or 'admin'.
export async function isAdmin(userId?: string) {
  const { profile, error } = await getUserProfile(userId);
  if (error) return false;
  return profile?.role === 'admin';
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
