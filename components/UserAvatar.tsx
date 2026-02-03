"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types/supabase";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import UserDropdown from "./UserDropdown";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sha256 } from "js-sha256";

function getGravatarURL(email: string) {
  const address = email.trim().toLowerCase();
  const hash = sha256(address);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`;
}



interface UserAvatarProps {
  className?: string;
}

const USER_CACHE_KEY = "user_profile_cache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedUserData {
  user: User;
  profile: UserProfile;
  timestamp: number;
}

export default function UserAvatar({ className = "" }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  // Helper function to check if cache is valid
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_EXPIRY_MS;
  };

  // Helper function to get cached data
  const getCachedData = (): CachedUserData | null => {
    try {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        const data: CachedUserData = JSON.parse(cached);
        if (isCacheValid(data.timestamp)) {
          return data;
        } else {
          // Cache expired, remove it
          localStorage.removeItem(USER_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error("Error reading cache:", error);
      localStorage.removeItem(USER_CACHE_KEY);
    }
    return null;
  };

  // Helper function to set cached data
  const setCachedData = (user: User, profile: UserProfile): void => {
    try {
      const cacheData: CachedUserData = {
        user,
        profile,
        timestamp: Date.now(),
      };
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  // Helper function to clear cached data
  const clearCachedData = (): void => {
    try {
      localStorage.removeItem(USER_CACHE_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First, check localStorage for cached data
        const cachedData = getCachedData();

        if (cachedData) {
          // Use cached data
          setUser(cachedData.user);
          setProfile(cachedData.profile);
          setLoading(false);
          return;
        }

        // If no valid cache, fetch from Supabase
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);

          // Fetch profile data
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileData && !error) {
            setProfile(profileData);
            // Cache the data
            setCachedData(user, profileData);
          }
        } else {
          // No user logged in, clear cache
          clearCachedData();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        clearCachedData();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        clearCachedData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-300 rounded-full ${className}`}>
      </div>
    );
  }

  if (!user || !profile) {
    // Guest user - show a generic icon
    const isHome = pathname === "/";
    const borderColor = isHome ? "#fff" : "#20231E";
    const textColor = isHome ? "#fff" : "#20231E";

    return (
      <div className="relative">
        <Link href="/login">
          <button
            className={`text-montserrat px-4 py-[5px] border rounded-full transition-colors font-semibold text-[16px] leading-[24px] cursor-pointer transition-all duration-500 hover:bg-gray-300 hover:text-white hover:border-black`}
            style={{ borderColor, color: textColor }}
          >
            Login
          </button>
        </Link>
        <UserDropdown
          isOpen={showDropdown}
          onClose={() => setShowDropdown(false)}
          user={user}
          profile={profile}
        />
      </div>
    );
  }

  // Logged in user - show initials
  const firstInitial = profile.first_name?.charAt(0)?.toUpperCase() || "";
  const lastInitial = profile.last_name?.charAt(0)?.toUpperCase() || "";
  const initials =
    firstInitial + lastInitial ||
    profile.email?.charAt(0)?.toUpperCase() ||
    "U";

  // Generate a consistent color based on user ID
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-gray-500",
  ];

  const colorIndex = user.id.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="relative">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer ${className}`}
        style={{
          backgroundColor: !profile.profile_img
            ? bgColor.replace("bg-", "")
            : undefined,
        }}
      >
        {profile.profile_img ? (
          <img
            src={profile.profile_img}
            alt={`${profile.first_name || "User"}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={getGravatarURL(profile.email)}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        )}

      </div>

      <UserDropdown
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        user={user}
        profile={profile}
      />
    </div>
  );
}