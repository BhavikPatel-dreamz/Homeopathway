"use client";

import { useEffect, useRef, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

// Single source of truth for client auth session. Only this hook calls
// supabase.auth.getSession / getUser / onAuthStateChange.
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted.current) return;
        setSession(data?.session ?? null);
      } catch (err) {
        console.error("useAuthSession: error fetching session:", err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    init();

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted.current) return;
      setSession(session ?? null);
      // ensure loading is false once event fires
      setLoading(false);
    });

    // Periodic revalidation to avoid long-idle desync (every 3 minutes)
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted.current) return;
        setSession(data?.session ?? null);
      } catch (err) {
        console.error("useAuthSession: session revalidation error:", err);
      }
    }, 3 * 60 * 1000);

    return () => {
      mounted.current = false;
      try { listener.subscription.unsubscribe(); } catch (e) { /* ignore */ }
      clearInterval(interval);
    };
  }, []);

  return { session, loading };
}

export default useAuthSession;
