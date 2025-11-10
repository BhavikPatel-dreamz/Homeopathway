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

  // if (loading) {
  //   return (
  //     <div className={`animate-pulse bg-gray-300 rounded-full ${className}`}>
  //     </div>
  //   );
  // }

  if (!user || !profile) {
    // Guest user - show a generic icon
    return (
      <div className="relative">
            <Link href="/login">
                <button className="text-montserrat px-4 py-[5px]  border border-[#20231E] rounded-full transition-colors font-semibold text-[16px] leading-[24px] text-[#20231E] cursor-pointer transition-all duration-500">
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