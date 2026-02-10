"use client";

import { useState, useEffect } from "react";
import useAuthSession from '@/lib/useAuthSession';
import Logo from "./header/Logo";
import SearchBar from "./SearchBar";
import Image from "next/image";
import ShareModal from "./ShareModal";
import UserAvatar from "./UserAvatar";
import SaveButton from "./SaveButton";

export default function HeaderInner() {
  const [showShareModal, setShowShareModal] = useState(false);
  const { session, loading } = useAuthSession();
  const user = session?.user ?? null;
  const [hasShadow, setHasShadow] = useState(false);

  // Auth session is driven by `useAuthSession`. We only use the `session`
  // value here for conditional UI; avoid calling supabase.auth APIs directly.

  // ✅ Only for visual effects (no layout changes)
  useEffect(() => {
    const handleScroll = () => setHasShadow(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[#f5f1e8] px-4 lg:px-6 py-[16px] transition-shadow duration-300 ${hasShadow ? "shadow-md" : ""
        }`}
    >
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-between items-center">
        <Logo />
        <SearchBar />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px] hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            title="Share this page"
          >
            <Image height={20} width={20} src="/share-icon.svg" alt="Share" />
          </button>

          {!loading && user && (
            <SaveButton className="w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px]" />
          )}

          <UserAvatar className="w-[28px] h-[28px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px]" />
        </div>
      </div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </header>
  );
}
