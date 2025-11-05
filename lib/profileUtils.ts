import { createClient } from './supabase/server';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * Update user profile in the profiles table
 */
export async function updateUserProfile(userId: string, data: ProfileUpdateData) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);
    
  return { error };
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfileById(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { profile: data, error };
}

/**
 * Update user email in both auth and profiles table
 */
export async function updateUserEmail(userId: string, newEmail: string) {
  const supabase = await createClient();
  
  // Update in auth
  const { error: authError } = await supabase.auth.updateUser({ 
    email: newEmail 
  });
  
  if (authError) {
    return { error: authError };
  }
  
  // Update in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email: newEmail })
    .eq('id', userId);
    
  return { error: profileError };
}

/**
 * Update user password
 */
export async function updateUserPassword(password: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({ 
    password: password 
  });
  
  return { error };
}