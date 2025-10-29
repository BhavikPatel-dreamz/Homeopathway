'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      // Fetch profile to get role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <header className="px-6 py-4 text-white">
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
    <header className="px-6 py-[17px] text-white">
      <div className="max-w-7xl mx-auto flex justify-end items-center">
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-white/60">
                    {profile?.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              {profile?.role === 'admin' && (
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
              <Link href="/login">
                <button className="text-montserrat px-6 py-2 hover:bg-teal-700 border-1 border-[#D3D6D1] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#D3D6D1]">
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
