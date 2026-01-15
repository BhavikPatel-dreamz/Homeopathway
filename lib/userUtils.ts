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
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking if user is logged in:', error);
      return false;
    }
    return session !== null && session?.user !== null;
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

    // Allow moderators to be considered privileged for admin access
    return profile?.role === 'admin' || profile?.role === 'moderator';
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

// General page checker - check if current page matches a specific path or array of paths
export const isPageChecker = (targetPath: string | string[]): boolean => {
  
  if (typeof window === 'undefined') {
    // Server-side: cannot determine current page
    return false;
  }
  
  const currentPath = window.location.pathname;
  
  
  // If targetPath is an array, check if current path matches any of them
  if (Array.isArray(targetPath)) {
    return targetPath.some(path => {
      // Exact match
      if (currentPath === path) {
        return true;
      }
      
      // Check if current path starts with target path (for nested routes)
      if (path !== '/' && currentPath.startsWith(path)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Single path logic (original functionality)
  // Exact match
  if (currentPath === targetPath) {
    return true;
  }
  
  // Check if current path starts with target path (for nested routes)
  if (targetPath !== '/' && currentPath.startsWith(targetPath)) {
    return true;
  }
  
  return false;
};

// Server-side compatible page checker - accepts pathname parameter for SSR
export const isPageCheckerSSR = (currentPath: string, targetPath: string | string[]): boolean => {
  // If targetPath is an array, check if current path matches any of them
  if (Array.isArray(targetPath)) {
    return targetPath.some(path => {
      // Exact match
      if (currentPath === path) {
        return true;
      }
      
      // Check if current path starts with target path (for nested routes)
      if (path !== '/' && currentPath.startsWith(path)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Single path logic
  // Exact match
  if (currentPath === targetPath) {
    return true;
  }
  
  // Check if current path starts with target path (for nested routes)
  if (targetPath !== '/' && currentPath.startsWith(targetPath)) {
    return true;
  }
  
  return false;
};

// Check if user is on a mobile device
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side: cannot determine device type
    return false;
  }

  // Check if it's a mobile device using user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';
  
  // Mobile device patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check user agent
  const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
  
  // Also check screen width as a fallback
  const isMobileScreen = window.innerWidth <= 768;
  
  // Check if it's a touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Return true if any mobile indicator is present
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

// Server-side compatible mobile device checker - accepts user agent parameter for SSR
export const isMobileDeviceSSR = (userAgent: string): boolean => {
  if (!userAgent) return false;
  
  // Mobile device patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  return mobileRegex.test(userAgent.toLowerCase());
};

// Check specific mobile platforms
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  return /iPad|iPhone|iPod/.test(userAgent);
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent);
};

// Check if device is tablet
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  const isTabletUserAgent = /tablet|ipad|playbook|silk/i.test(userAgent);
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return isTabletUserAgent || isTabletScreen;
};

// Check if device is desktop
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !isMobileDevice() && !isTablet();
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
  return profile?.role === 'admin' || profile?.role === 'moderator';
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