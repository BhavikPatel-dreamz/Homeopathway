'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/supabase';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import UserDropdown from './UserDropdown';
import Link from 'next/link';

interface UserAvatarProps {
  className?: string;
}

export default function UserAvatar({ className = "" }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          
          // Fetch profile data
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData && !error) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
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
    return (
      <div className="relative mr-[10pc]">
            <Link href="/login">
                <button className="text-montserrat px-4 py-[5px] hover:bg-transparent hover:text-[#20231E] border border-[#D3D6D1] hover:border-[#20231E] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#D3D6D1] cursor-pointer transition-all duration-500">
                  Login
                </button>
              </Link>
        {/* <div 
          className={`bg-gray-400 rounded-full flex items-center justify-center ${className}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div> */}
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
  const firstInitial = profile.first_name?.charAt(0)?.toUpperCase() || '';
  const lastInitial = profile.last_name?.charAt(0)?.toUpperCase() || '';
  const initials = firstInitial + lastInitial || profile.email?.charAt(0)?.toUpperCase() || 'U';

  // Generate a consistent color based on user ID
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500'
  ];
  
  const colorIndex = user.id.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="relative">
      <div 
        className={`${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span>{initials}</span>
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