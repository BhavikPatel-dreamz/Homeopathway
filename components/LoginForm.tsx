"use client";
import { useState } from 'react';
import { signInWithEmail, signInWithGoogle, getUserProfile } from '../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    
    try {
      console.log('🔐 Attempting login...');
      const { data, error } = await signInWithEmail({ email, password });
      
      if (error) {
        console.error('❌ Login error:', error);
        setLoading(false);
        setMessage(error.message || 'Failed to sign in');
        return;
      }

      console.log('✅ Login successful, user:', data?.user?.email);
      console.log('📝 User ID:', data?.user?.id);

      // Get user profile to check role
      if (data?.user) {
        console.log('🔍 Fetching user profile...',);
        const { profile, error: profileError } = await getUserProfile(data.user.id);
        
        console.log('📋 Profile data:', profile);
        console.log('👤 User role:', profile?.role);
        
        if (profileError) {
          console.error('❌ Profile fetch error:', profileError);
          setLoading(false);
          setMessage(`Profile error: ${profileError.message}`);
          return;
        }
        
        if (!profile) {
          console.error('⚠️ Profile still not found after auto-create attempt');
          setLoading(false);
          setMessage('Unable to create profile. Please check database permissions.');
          return;
        }
        
        // Success! Redirect based on role
        if (profile?.role === 'admin') {
          // Redirect admin to dashboard
          console.log('👑 Redirecting admin to dashboard');
          router.push('/admin');
        } else {
          // Redirect regular user to home page
          console.log('👤 Redirecting user to home');
          router.push('/');
        }
      } else {
        console.warn('⚠️ No user data returned');
        setLoading(false);
        setMessage('Signed in successfully');
      }
    } catch (err) {
      setLoading(false);
      setMessage('An error occurred during sign in');
      console.error('💥 Login error:', err);
    }
  }

  async function handleGoogle() {
    setMessage(null);
    setLoading(true);
    const { data, error } = await signInWithGoogle();
    
    if (error) {
      setLoading(false);
      setMessage(error.message || 'Failed to sign in with Google');
      return;
    }

    // Note: Google OAuth redirect is handled by Supabase
    // You'll need to set up a callback page to handle role-based redirect
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3ED] px-4">
      <div className="bg-white rounded-[8px] pt-6 pb-6 pl-4 pr-4 md:pt-12 md:pb-12 md:pl-10 md:pr-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-25 h-22">
            <img src="/login-logo.svg" alt="" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-serif text-center mb-2">Welcome Back!</h1>
        <p className="text-[#41463B] text-center text-[16px] font-[500]  mb-6">
          Glad to see you again.<br />
          Login to your account below.
        </p>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-[#20231E] mb-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <img src="/email.svg" alt="" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-2.5 placeholder-[#41463B] font-[500] placeholder:font-[400] text-[16px] text-[#41463B] bg-[#F1F2F0] hover:bg-[#D3D6D1] focus:bg-[#ffffff]  border border-[#D3D6D1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C7463] focus:border-transparent transition-all duration-500"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-[#20231E] mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <img src="/password.svg" alt="" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-12 py-2.5 placeholder-[#41463B] font-[500] placeholder:font-[400] text-[16px] text-[#41463B] bg-[#F1F2F0] hover:bg-[#D3D6D1] focus:bg-[#ffffff] border border-[#D3D6D1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C7463] focus:border-transparent transition-all duration-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cusror-pointer"
              >
                  {showPassword ? (
                    <img src="/eye-line.svg" alt="" />
                  ) : (
                    <img src="/eye-close.svg" alt="" />
                  )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right mb-6">
            <Link href="/forgot-password" className="text-xs text-[#4B544A] hover:text-[#0B0C0A] underline font-[500] transition-all duration-500">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6C7463] text-white py-3 font-[600] rounded-full  hover:bg-[#565D4F] transition-colors  cursor-pointer transition-all duration-500"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {/* Error/Success Message */}
          {message && (
            <p className={`text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Signup Link */}
          <p className="text-center text-sm text-[#83857D] font-[500] mb-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#4B544A] hover:text-[#20231E] font-[600] underline hover:underline transition-all duration-500">
              Signup
            </Link>
          </p>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div> */}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-[#F1F2F0] border border-[#D3D6D1] text-[16px] text-[#41463B] py-2.5 rounded-[8px] font-medium hover:bg-[#D3D6D1] transition-colors  flex items-center cursor-pointer justify-center gap-2 transition-all duration-500"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
