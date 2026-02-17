"use client";
import { useState, useEffect } from 'react';
import { signInWithEmail, signInWithGoogle, getUserProfile } from '../lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      console.log('🔐 Attempting login...');
      const { data, error: signInError } = await signInWithEmail({ email, password });

      if (signInError) {
        console.error('❌ Login error:', signInError);
        setLoading(false);

        // User-friendly error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else if (signInError.message.includes('User not found')) {
          setError('No account found with this email address.');
        } else {
          setError(signInError.message || 'Failed to sign in. Please try again.');
        }
        return;
      }

      console.log('✅ Login successful, user:', data?.user?.email);
      // Get user profile to check role
      if (data?.user) {
        console.log('🔍 Fetching user profile...');
        const { profile, error: profileError } = await getUserProfile(data.user.id);

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError);
          setLoading(false);
          setError(`Profile error: ${profileError.message}`);
          return;
        }

        if (!profile) {
          console.error('⚠️ Profile still not found after auto-create attempt');
          setLoading(false);
          setError('Unable to create profile. Please contact support.');
          return;
        }

        // Success! Set success message briefly before redirect
        setSuccess('Login successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          if (profile?.role === 'admin' || profile?.role === 'moderator') {
            console.log('👑 Redirecting admin/moderator to dashboard');
            router.push('/admin');
          } else {
            console.log('👤 Redirecting user to home');
            router.push('/');
          }
        }, 500);
      } else {
        setLoading(false);
        setError('Sign in failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  }

  async function handleGoogle() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const { data, error: googleError } = await signInWithGoogle();

    if (googleError) {
      setLoading(false);
      setError(googleError.message || 'Failed to sign in with Google. Please try again.');
      return;
    }

    // Note: Google OAuth redirect is handled by Supabase
    setLoading(false);
  }

  useEffect(() => {
    try {
      const registered = searchParams?.get('registered');
      const msg = searchParams?.get('msg');
      if (registered) {
        setSuccess(msg ? decodeURIComponent(msg) : 'Registration successful. Please login.');
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3ED] px-4">
      <div className="bg-white rounded-xl pt-6 pb-6 pl-4 pr-4 md:pt-12 md:pb-12 md:pl-10 md:pr-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-25 h-22">
            <Link href="/" className='cursor-pointer'>
              <img src="/login-logo.svg" alt="" />
            </Link>
          </div>
        </div>

        {/* Heading */}
        <h1 className=" font-serif text-center mb-2 text-3xl sm:text-2xl md:text-3xl lg:text-[32px] leading-tight font-normal text-[#0B0C0A]">Welcome Back!</h1>
        <p className="text-[#41463B] text-center text-[16px] font-medium mb-6">
          Glad to see you again.<br />
          Login to your account below.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

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
                className="w-full pl-9 pr-4 py-2.5 placeholder-[#41463B] font-medium placeholder:font-normal text-base text-[#41463B] bg-[#F1F2F0] hover:bg-[#D3D6D1] focus:bg-[#ffffff] border border-[#D3D6D1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C7463] focus:border-transparent transition-all duration-500"
                required
                autoFocus
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
                className="w-full pl-9 pr-12 py-2.5 placeholder-[#41463B] font-medium placeholder:font-normal text-base text-[#41463B] bg-[#F1F2F0] hover:bg-[#D3D6D1] focus:bg-[#ffffff] border border-[#D3D6D1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C7463] focus:border-transparent transition-all duration-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
            <Link href="/forgot-password" className="text-xs text-[#4B544A] hover:text-[#0B0C0A] underline font-medium transition-all duration-500">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6C7463] text-white py-3 font-semibold rounded-full hover:bg-[#565D4F] cursor-pointer transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-[#83857D] font-medium mb-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#4B544A] hover:text-[#20231E] font-medium underline hover:underline transition-all duration-500">
              Signup
            </Link>
          </p>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-[#F1F2F0] border border-[#D3D6D1] text-[16px] text-[#41463B] py-2.5 rounded-lg font-medium hover:bg-[#D3D6D1] transition-colors flex items-center cursor-pointer justify-center gap-2 duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}