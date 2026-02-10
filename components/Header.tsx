'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import useAuthSession from '@/lib/useAuthSession';
import HeaderLogin from "./HeaderLogin";
import HeaderInner from "./HeaderInner";

export default function Header() {
  const { session, loading } = useAuthSession();
  const pathname = usePathname();

  // check if current page is home
  const isHome = pathname === "/";

  // No local auth checks here — rely on `useAuthSession` for a single source of truth.

  // ✅ if inner page → show HeaderInner only
  if (!isHome) {
    return <HeaderInner />;
  }

  // ✅ if home page → show full Header
  return (
    <header className='sticky top-0 left-0 w-full px-6 py-[17px] text-white z-50 '>
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-end items-center">
        <div className="flex items-center gap-3">
          {loading ? (
            <div style={{ width: 96, height: 40 }} />
          ) : session?.user ? (
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
