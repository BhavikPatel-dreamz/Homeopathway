"use client";

import { useEffect, useState } from "react";
import useAuthSession from "@/lib/useAuthSession";
import { getUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, expiresUTC: string) {
  if (typeof document === "undefined") return;
  // Keep path=/ so cookie is available across site and use SameSite=Lax for safety
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiresUTC}; path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const { session } = useAuthSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const existing = getCookie("cookie_consent");
      setVisible(!existing);
    } catch (e) {
      // If anything fails, show the banner so user can choose
      setVisible(true);
    }
  }, []);

  const handleChoice = async (value: "accepted" | "rejected") => {
    // expiry exactly 2 hours from now
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toUTCString();
    setCookie("cookie_consent", value, expires);
    setVisible(false);

    try {
      const userId = session?.user?.id ?? null;
      if (!userId) return;

      // Fetch profile and detect any existing cookie/consent-related field
      const { profile, error } = await getUserProfile(userId);
      if (error || !profile) return;

      const key = Object.keys(profile).find((k) => /cookie|consent/i.test(k));
      if (!key) return;

      // Only update if a matching field already exists in profile
      await supabase.from("profiles").update({ [key]: value }).eq("id", userId);
    } catch (err) {
      // non-fatal
      console.error("CookieConsent: failed to persist to profile:", err);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed left-4 right-4 bottom-6 z-[9999] md:left-8 md:right-8">
      <div
        role="dialog"
        aria-live="polite"
        className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4"
      >
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[#2B2E28] mb-1">We use cookies</h3>
          <p className="text-sm text-[#41463B]">
            We use cookies to personalise content, provide social media features, and analyze our traffic. Essential cookies are required for the site to
            function. Non-essential cookies help us improve the experience — you can accept or reject them below. This choice will be remembered for 2 hours.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          <button
            onClick={() => handleChoice("rejected")}
            aria-label="Reject cookies"
            className="px-4 py-2 rounded-full border border-gray-300 bg-[#F1F2F0] text-[#2B2E28] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4B544A]/30"
          >
            Reject
          </button>
          <button
            onClick={() => handleChoice("accepted")}
            aria-label="Accept cookies"
            className="px-4 py-2 rounded-full bg-[#4B544A] text-white hover:bg-[#2B2E28] focus:outline-none focus:ring-2 focus:ring-[#4B544A]/50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
