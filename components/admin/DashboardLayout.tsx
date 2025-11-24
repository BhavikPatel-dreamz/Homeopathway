"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export default function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


   const navigation = [
  { name: 'Overview', href: '/admin', icon: '📊' },
  { 
    name: 'Ailments', 
    href: '/admin/ailments', 
    icon: '' 
  },
  { 
    name: 'Remedies', 
    href: '/admin/remedies', 
    icon: '' 
  },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Reviews', href: '/admin/reviews', icon: '⭐' },
];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#4B544A] text-white transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
        <Link href="/admin">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <img src="/favicon.svg" alt="" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold">Homeopathway</h1>
                <p className="text-xs text-white">Admin Panel</p>
              </div>
            )}
          </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                {item.icon=='' ? (
             <Image 
                  src={item.name =='Ailments'? '/ailments-icon.svg':'/top-remedies.svg'} 
                  alt={`${item.name} icon`} 
                  width={21} 
                  height={21}
              />
           ) : (
              <span>{item.icon}</span>
             )}
                  {isSidebarOpen && (
                    <span className={isActive ? "font-semibold" : "font-medium"}>
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">👤</span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{userName || 'Admin'}</p>
                <p className="text-xs text-white">Administrator</p>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          {isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#4B544A] border border-white/20 rounded-full flex items-center justify-center text-white  transition-colors"
        >
          <span className="text-xs">{isSidebarOpen ? '←' : '→'}</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">
                  {navigation.find((item) => pathname === item.href)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage your homeopathy platform
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                    Profile
                  </button>
                </Link>
                <Link href="/">
                  <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                    View Site
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
