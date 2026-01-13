import { createClient } from './supabase/server';

// Server-side auth helpers for use in Server Components
// These functions use the server-side Supabase client

export async function getUserProfile(userId?: string) {
  const supabase = await createClient();
  
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
  
  
  return { profile: data, error: null };
}

// Server-side helper for checking if a user is admin.
// This reads the profiles table and expects a `role` column with values 'user' or 'admin'.
export async function isAdmin(userId?: string) {
  const { profile, error } = await getUserProfile(userId);
  if (error) return false;
  // Allow 'admin' and 'moderator' to access admin area (moderator has limited privileges)
  return profile?.role === 'admin' || profile?.role === 'moderator';
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}
