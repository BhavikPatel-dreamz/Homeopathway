'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sha256 } from "js-sha256";


function getGravatarURL(email: string) {
  const address = email.trim().toLowerCase();
  const hash = sha256(address);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=64`;
}

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserProfile | null;
}

export default function UserDropdown({ isOpen, onClose, user, profile }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push('/login');
  };

  if (!isOpen) return null;

  if (!user || !profile) {
    // Guest user dropdown
    return (
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[1002]"
      >
        <Link
          href="/login"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // Logged in user dropdown
  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[1002]"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <img
          src={profile.profile_img || getGravatarURL(profile.email)}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover border"
        />

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {profile.email}
          </p>

          {profile.role === "admin" && (
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Admin
            </span>
          )}
          {profile.role === "moderator" && (
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Moderator
            </span>
          )}
        </div>
      </div>


      {/* Menu Items */}
      <Link
        href="/profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        My Profile
      </Link>

      {(profile.role === 'admin' || profile.role === 'moderator') && (
        <Link
          href="/admin"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Admin Dashboard
        </Link>
      )}

      <div className="border-t border-gray-100 my-1"></div>

      <Link
        href="/help-center"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        Help Center
      </Link>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={handleSignOut}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
        Sign Out
      </button>
    </div>
  );
}