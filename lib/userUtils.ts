import { UserProfile } from '@/types/supabase';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

// Check if user is logged in
export const isUserLoggedIn = (user: User | null): boolean => {
  return user !== null && !!user.id;
};

// Get current logged in user from Supabase
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Check if current session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return false;
    }
    return session !== null && session.user !== null;
  } catch (error) {
    console.error('Error in isSessionValid:', error);
    return false;
  }
};

// Check if any user is currently logged in (no parameters needed)
export const checkIsUserLoggedIn = async (): Promise<boolean> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error checking if user is logged in:', error);
      return false;
    }
    return user !== null && !!user.id;
  } catch (error) {
    console.error('Error in checkIsUserLoggedIn:', error);
    return false;
  }
};

// Check if current user is admin (no parameters needed)
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('Error getting current user for admin check:', error);
      return false;
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting user profile for admin check:', profileError);
      return false;
    }

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
};

// Check if current page is home (no parameters needed)
export const isHome = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side: cannot determine current page
    return false;
  }
  
  const currentPath = window.location.pathname;
  return currentPath === '/' || currentPath === '/home';
};

// Example utility functions using the typed user object
export const getUserDisplayName = (user: User | null, profile: UserProfile | null): string => {
  if (!user) return 'Guest';
  
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  return user.email || 'User';
};

export const isAdmin = (profile: UserProfile | null): boolean => {
  return profile?.role === 'admin';
};

export const getUserEmail = (user: User | null): string => {
  return user?.email || '';
};

export const getUserId = (user: User | null): string => {
  return user?.id || '';
};

export const isUserEmailVerified = (user: User | null): boolean => {
  return user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;
};

// Type guard to check if user is fully loaded
export const isUserComplete = (user: User | null): user is User => {
  return user !== null && !!user.id && !!user.email;
};