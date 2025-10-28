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
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
    userEmail = user?.email;
    
    console.log('👤 Current user from auth:', { id: userId, email: userEmail });
  }

  if (!userId) {
    console.log('⚠️ No userId provided to getUserProfile');
    return { profile: null, error: null };
  }

  console.log('🔍 Querying profile for userId:', userId);

  // Try to get profile - using single() instead of maybeSingle() for better error handling
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  console.log('📊 Query result - data:', data, 'error:', error);

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
        
        console.log('💾 Insert result - data:', newProfile, 'error:', createError);
        
        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          return { profile: null, error: createError };
        }
        
        console.log('✅ Profile created successfully:', newProfile);
        return { profile: newProfile, error: null };
      } else {
        console.error('❌ No email available to create profile');
      }
    }
    
    return { profile: null, error };
  }
  
  console.log('✅ Profile found:', data);
  return { profile: data, error: null };
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
