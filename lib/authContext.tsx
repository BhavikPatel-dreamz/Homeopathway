"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { getUserProfile, signOut as signOutAuth } from './auth';
import useAuthSession from './useAuthSession';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthSession();
  const [profile, setProfile] = useState<any | null>(null);
  const [refreshingProfile, setRefreshingProfile] = useState(false);
  const pathname = usePathname();

  const user = session?.user ?? null;

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        setRefreshingProfile(true);
        const { profile } = await getUserProfile(user.id);
        if (!mounted) return;
        setProfile(profile);
      } catch (err) {
        console.error('Error fetching profile in AuthProvider:', err);
      } finally {
        if (mounted) setRefreshingProfile(false);
      }
    };

    // Only load profile when session/user is available
    if (!loading) loadProfile();

    // When route changes or tab visibility changes, re-fetch profile to keep data fresh
    const handleRouteChange = () => {
      if (!mounted || !user) return;
      loadProfile();
    };

    let prevPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    const interval = setInterval(() => {
      if (!mounted) return;
      if (typeof window !== 'undefined' && window.location.pathname !== prevPath) {
        prevPath = window.location.pathname;
        handleRouteChange();
      }
    }, 500);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleRouteChange();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loading, user, pathname]);

  const handleSignOut = async () => {
    await signOutAuth();
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading: loading || refreshingProfile,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}