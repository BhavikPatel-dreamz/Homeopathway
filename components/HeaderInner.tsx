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
  const [showShareModal, setShowShareModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasShadow, setHasShadow] = useState(false);

  // ✅ Supabase auth
  useEffect(() => {
    const fetchUser = async () => {
      // Fast-path: try reading cached user/profile to avoid flashing Login
      try {
        const cached = localStorage.getItem('user_profile_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          const FIVE_MIN = 5 * 60 * 1000;
          if (age < FIVE_MIN && parsed.user) {
            setUser(parsed.user);
          }
        }
      } catch (e) {
        // ignore cache parse errors
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

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

          {user && (
            <SaveButton className="w-[25px] h-[25px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px]" />
          )}

          <UserAvatar className="w-[28px] h-[28px] md:w-[35px] md:h-[35px] lg:w-[44px] lg:h-[44px]" />
        </div>
      </div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </header>
  );
}
