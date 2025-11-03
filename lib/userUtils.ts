import { SupabaseUser, UserProfile } from '@/types/supabase';

// Example utility functions using the typed user object
export const getUserDisplayName = (user: SupabaseUser | null, profile: UserProfile | null): string => {
  if (!user) return 'Guest';
  
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  return user.email || 'User';
};

export const isAdmin = (profile: UserProfile | null): boolean => {
  return profile?.role === 'admin';
};

export const getUserEmail = (user: SupabaseUser | null): string => {
  return user?.email || '';
};

export const getUserId = (user: SupabaseUser | null): string => {
  return user?.id || '';
};

export const isUserEmailVerified = (user: SupabaseUser | null): boolean => {
  return user?.user_metadata?.email_verified === true;
};

// Type guard to check if user is fully loaded
export const isUserComplete = (user: SupabaseUser | null): user is SupabaseUser => {
  return user !== null && !!user.id && !!user.email;
};