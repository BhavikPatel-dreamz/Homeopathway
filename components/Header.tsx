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
    const checkUser = async () => {
      const loggedIn = await checkIsUserLoggedIn();
      setIsLoggedIn(loggedIn);
    };
    checkUser();
    // Listen for auth state changes so header updates when session is restored
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
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
