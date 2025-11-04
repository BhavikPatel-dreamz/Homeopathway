
'use client';

import { supabase } from "@/lib/supabaseClient"
import { checkIsAdmin } from "@/lib/userUtils"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function HeaderLogin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
   
    router.push('/');
    window.location.reload();
  };
    
  return (
    <>
      {/* Navigation Links */}
      {isAdmin && (
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
  )
}
