"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import UserAvatar from "./UserAvatar";
import Breadcrumb from './Breadcrumb';

interface AccountSettingsProps {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
   accountContext?: {
    id: string;
    name: string;
    slug: string;
  };
}



export default function AccountSettings({ user,accountContext }: AccountSettingsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    password: '',
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field
      
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Redirect to login regardless of error (sometimes signOut fails but user is logged out)
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to login anyway
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] ">
       {/* Header */}
        <div className="">
           {/* Breadcrumb */}
                <Breadcrumb
        items={
          accountContext
            ? [
                { label: "Home", href: "/" },
                { label: "Account Settings", isActive: true },
              ]
            : [
                { label: "Home", href: "/" },
                { label: "Account Settings", href: "/account" },
              ]
        }
      />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-5 py-9">
        <div className="bg-white rounded-[12px] py-10 px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif text-gray-900">Account Settings</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center xs:w-[150pxj ustify-end gap-2 py-2 text-[#20231E] cursor-pointer rounded-lg transition-colors"
              >
                <img src="/edit-profile.svg" alt="" />
                <span className="font-medium mt-0.5">Edit Profile</span>
              </button>
            )}
          </div>

          <div className="flex items-start lg:items-center justify-between mb-6 flex-col lg:flex-row gap-4 lg:gap-0">
            <UserAvatar className=" w-[80px] h-[80px] text-[30px] font-semibold cursor-pointer hover:opacity-80 transition-opacity" />
            <div className="flex items-center gap-2">
                <button className='bg-[#6C7463]  hover:bg-[#565D4F] flex items-center text-white text-[16px] font-semibold px-3 py-1.5 rounded-[50px] cursor-pointer  transition-all duration-500'><img className='mr-2' src="/upload-icon.svg" alt="" />Upload Image</button>
                <button className='bg-[#FCEBEC] flex items-center text-[#B62E31] text-[16px] font-semibold px-3 py-1.5 rounded-[50px] cursor-pointer  transition-all duration-500'><img className='mr-2' src="/remove.svg" alt="" />Remove</button>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#20231E] mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <img src="/user-gray.svg" alt="" />
                </span>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D3D6D1] text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                />
              </div>
            </div>

            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-[#20231E] mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <img src="/user-gray.svg" alt="" />
                </span>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D3D6D1] text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#20231E] mb-2">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 py-3 border border-[#D3D6D1] text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent  disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                />
              </div>
            </div>

            {/* Current Password */}  
              <p className='text-[20px] font-semibold text-[#0B0C0A] mb-4'>Password</p>
              <div>
              <label className="block text-sm font-medium text-[#20231E] mb-2">
              Current Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Enter new password to change" : "••••••••••"}
                  className="w-full pl-10 pr-4 py-2.5 py-3 border border-[#D3D6D1] text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* New Password */}  
            <div>
              <label className="block text-sm font-medium text-[#20231E] mb-2">
              New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Enter new password to change" : "••••••••••"}
                  className="w-full pl-10 pr-4 py-2.5 py-3 border border-[#D3D6D1] text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                />


                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>

                )}
              </div>
              <div className='mt-1.5'>
                <p className='text-[12px] text-[#41463B]'>Minimum 8 character, at least one special character, one number</p>
              </div>
              
            </div>

            {/* Confirmed Password */}  
            <div>
              <label className="block text-sm font-medium text-[#20231E] mb-2">Confirmed Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Enter new password to change" : "••••••••••"}
                  className="w-full pl-10 pr-4 py-2.5 py-3 border border-[#D3D6D1] text-[16px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7B5E] focus:border-transparent disabled:bg-[#F1F2F0] disabled:text-[#41463B]"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* {!isEditing && (
              <div className="mt-2 text-right">
                <button className="text-sm text-[#6B7B5E] hover:underline">
                  Reset Password?
                </button>
              </div>
            )} */}

            {/* Action Buttons */}
            {/* {isEditing && ( */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: `${user.first_name} ${user.last_name}`.trim(),
                      email: user.email,
                      password: '',
                    });
                    setMessage(null);
                  }}
                  disabled={loading}
                  className="px-2.5 py-3 text-[#2B2E28] rounded-[50px] font-semibold transition-colors transition-all duration-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className=" px-6 py-3 bg-[#6C7463] text-white rounded-[50px] font-semibold hover:bg-[#5A6A4D] transition-colors cursor-pointer transition-all duration-500"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            {/* // )} */}

            {/* Logout Button */}
        
          </div>
        </div>

        {!isEditing && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-[#FCEBEC] w-full lg:w-auto text-[#B62E31] rounded-[50px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <img src="/logout.svg" alt="" />
                  <span>Logout</span>
                </button>
              </div>
            )}
      </main>

      

    
    </div>
  );
}
