'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { checkIsUserLoggedIn } from "@/lib/userUtils";
import { supabase } from '@/lib/supabaseClient';
import HeaderLogin from "./HeaderLogin";
import HeaderInner from "./HeaderInner";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname();

  // check if current page is home
  const isHome = pathname === "/";

  useEffect(() => {
    let falseTimer: ReturnType<typeof setTimeout> | null = null;
    const checkUser = async () => {
      // First try a fast local cache check to avoid flashing Login when
      // navigating between admin and site. This mirrors the UserAvatar
      // `user_profile_cache` mechanism and uses a 5 minute expiry.
      let loggedIn = false;
      try {
        const cached = localStorage.getItem('user_profile_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          const FIVE_MIN = 5 * 60 * 1000;
          if (age < FIVE_MIN && parsed.user) {
            loggedIn = true;
          }
        }
      } catch (e) {
        // ignore cache parse errors and fall back to checkIsUserLoggedIn
      }

      if (!loggedIn) {
        loggedIn = await checkIsUserLoggedIn();
      }
      // If loggedIn is true set immediately. If false, wait briefly to allow
      // the auth subscription to restore a session on client-side navigation.
      if (loggedIn) {
        setIsLoggedIn(true);
      } else {
        // Delay setting to false so we don't flash the Login button when
        // navigating from admin -> site before Supabase restores session.
        // Increase the delay to give Supabase more time to restore cookies
        // during client-side navigation (prevents brief Login flash).
        falseTimer = setTimeout(() => {
          setIsLoggedIn(false);
        }, 1500);
      }
    };
    checkUser();

    // Listen for auth state changes so header updates when session is restored
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (falseTimer) {
        clearTimeout(falseTimer);
        falseTimer = null;
      }
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      if (falseTimer) clearTimeout(falseTimer);
      subscription.unsubscribe();
    };
  }, []);

  // ✅ if inner page → show HeaderInner only
  if (!isHome) {
    return <HeaderInner />;
  }

  // ✅ if home page → show full Header
  return (
    <header className='sticky top-0 left-0 w-full px-6 py-[17px] text-white z-50 '>
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-end items-center">
        <div className="flex items-center gap-3">
          {isLoggedIn === null ? (
            // auth state still loading — render a small placeholder to avoid showing Login briefly
            <div style={{ width: 96, height: 40 }} />
          ) : isLoggedIn ? (
            <HeaderLogin />
          ) : (
            <>
              <Link href="/login">
                <button className="text-montserrat px-4 py-[5px] hover:bg-transparent hover:text-[#20231E] border border-[#D3D6D1] hover:border-[#20231E] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#D3D6D1] cursor-pointer transition-all duration-500">
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
