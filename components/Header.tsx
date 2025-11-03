/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SupabaseUser, UserProfile } from "@/types/supabase";
import {  isAdmin } from "@/lib/userUtils";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
   

    if (user) {
      // Type assertion since we know the structure matches our interface
      setUser(user as SupabaseUser);
      
      // Fetch profile to get role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData as UserProfile);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial user authentication check on component mount
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <header className="fixed top-0 left-0 w-full px-6 py-4 text-white z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Home</h1>
          <div className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full animate-pulse">
            <span className="opacity-0">Loading</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full px-6 py-[17px] text-white z-50">
      <div className="max-w-7xl mx-auto flex justify-end items-center">
        
        <div className="flex items-center gap-8">
          {user ? (
            <>
              {/* User Info */}
              {/* <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {getUserDisplayName(user, profile)}
                  </p>
                  <p className="text-xs text-white/60">
                    {isAdmin(profile) ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
              </div> */}

              {/* Navigation Links */}
              {isAdmin(profile) && (
                <Link href="/admin/dashboard">
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-full transition-colors text-sm ">
                    Dashboard
                  </button>
                </Link>
              )}
              
              <Link href="/profile">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm">
                  Profile
                </button>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600/80 hover:bg-red-700 rounded-full transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
             <Link href="">
                <button className="font-[600] text-[#D3D6D1] text-[16px] flex items-center hover:text-[#20231E]">
                  <Image 
                    src="/save-icon.svg" 
                    alt="Save icon" 
                    width={16} 
                    height={16} 
                    className="mr-2" 
                  />
                  Save
                </button>
              </Link>
              <Link href="/login">
                <button className="text-montserrat px-4 py-[5px] hover:bg-transparent hover:text-[#20231E] border-1 border-[#D3D6D1] hover:!border-[#20231E] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#D3D6D1] cursor-pointer transition-all duration-500">
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
