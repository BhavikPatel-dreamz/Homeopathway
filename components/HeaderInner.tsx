"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Logo from "./header/Logo";
import SearchBar from "./SearchBar";
import Image from "next/image";
import ShareModal from "./ShareModal";
import UserAvatar from "./UserAvatar";
import SaveButton from "./SaveButton";

export default function HeaderInner() {
  const [isSticky, setIsSticky] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  // ✅ Check Supabase Auth State
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`bg-[#f5f1e8] w-full px-4 lg:px-6 py-[16px] text-white z-50 transition-all duration-500 ${
        isSticky ? "fixed top-0 left-0 shadow-md z-[1000]" : "relative"
      }`}
    >
      <div className="max-w-7xl mx-auto px-0 lg:px-5 flex justify-between items-center">
        {/*------ Main Logo -----*/}
        <Logo />

        {/*------ Searchbar -----*/}
        <SearchBar />

        {/*------ Header Buttons -----*/}
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px] cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
            title="Share this page"
          >
            <Image height={20} width={20} src="/share-icon.svg" alt="Share" />
          </button>

          {/* ✅ Show SaveButton only if logged in */}
          {user && (
            <SaveButton className="w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px]" />
          )}

          {/* User Avatar (always visible) */}
          <UserAvatar className="w-[28px] h-[28px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px] text-[12px] lg:text-[16px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" />
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </header>
  );
}
