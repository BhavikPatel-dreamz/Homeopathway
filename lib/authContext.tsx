"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { supabase } from './supabaseClient';
import { getUserProfile } from './auth';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingProfile, setRefreshingProfile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    // Get initial session and profile. Keep `loading` true until we resolve the first state.
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setRefreshingProfile(true);
          const { profile } = await getUserProfile(session.user.id);
          if (!mounted) return;
          setProfile(profile);
          setRefreshingProfile(false);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth state changes to handle token refresh / sign in / sign out
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Only react to meaningful events to avoid extra work during transient states
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          setUser(session.user);
          try {
            setRefreshingProfile(true);
            const { profile } = await getUserProfile(session.user.id);
            if (!mounted) return;
            setProfile(profile);
          } catch (err) {
            console.error('Error fetching profile on auth change:', err);
          } finally {
            if (mounted) setRefreshingProfile(false);
          }
        }
      } else if (event === 'SIGNED_OUT' || session == null) {
        setUser(null);
        setProfile(null);
      }

      // After handling auth change, make sure loading is false so UI can render fallback
      if (mounted) setLoading(false);
    });

    const subscription = data?.subscription;

    // Periodic session check: ensures that long-running tabs re-sync session/profile
    const sessionPollInterval = setInterval(async () => {
      if (!mounted) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          // if we don't have user or user id changed, refresh profile
          if (!user || user.id !== session.user.id) {
            setUser(session.user);
            setRefreshingProfile(true);
            const { profile } = await getUserProfile(session.user.id);
            if (!mounted) return;
            setProfile(profile);
            setRefreshingProfile(false);
          }
        } else {
          // no session
          if (user) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error during session polling:', err);
      }
    }, 4 * 60 * 1000); // every 4 minutes

    // Re-fetch profile when route changes (helps when session refreshed in background)
    const handleRouteChange = async () => {
      if (!mounted) return;
      if (!user) return;
      try {
        setRefreshingProfile(true);
        const { profile } = await getUserProfile(user.id);
        if (!mounted) return;
        setProfile(profile);
      } catch (err) {
        console.error('Error reloading profile on route change:', err);
      } finally {
        if (mounted) setRefreshingProfile(false);
      }
    };

    // Watch pathname changes
    const unwatch = () => { /* placeholder to satisfy cleanup closure */ };

    // Use a small interval to detect pathname changes and trigger profile refresh
    let prevPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    const interval = setInterval(() => {
      if (!mounted) return;
      if (typeof window !== 'undefined' && window.location.pathname !== prevPath) {
        prevPath = window.location.pathname;
        handleRouteChange();
      }
    }, 500);

    // Visibility change: when user returns to tab, ensure session/profile are in sync
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;
            if (session?.user) {
              setUser(session.user);
              setRefreshingProfile(true);
              const { profile } = await getUserProfile(session.user.id);
              if (!mounted) return;
              setProfile(profile);
            }
          } catch (err) {
            console.error('Error on visibility change:', err);
          } finally {
            if (mounted) setRefreshingProfile(false);
          }
        })();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch (e) {
        // ignore
      }
      clearInterval(interval);
      clearInterval(sessionPollInterval);
      document.removeEventListener('visibilitychange', onVisibility);
      unwatch();
    };
  }, []);

  const handleSignOut = async () => {
    const { signOut } = await import('./auth');
    await signOut();
    setUser(null);
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