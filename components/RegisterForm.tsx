"use client";
import { useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '../lib/auth';
import Link from 'next/link';

export default function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const { data, error } = await signUpWithEmail({ email, password, firstName, lastName });
    setLoading(false);

    if (error) {
      setMessage(error.message || 'Failed to register');
      return;
    }

    setMessage('Registration successful. Please check your email to confirm.');
  }

  async function handleGoogle() {
    setMessage(null);
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3ED] px-4">
      <div className="bg-white rounded-3xl pt-6 pb-6 pl-4 pr-4 md:pt-12 md:pb-12 md:pl-10 md:pr-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-25 h-22">
            <img src="/login-logo.svg" alt="" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-serif text-center mb-2">Signup</h1>
        <p className="text-[#41463B] text-center text-[16px] font-[500] mb-8">
          Enter your details below to create your<br />
          account and get started.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-[#20231E] mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <img src="/user.svg" alt="" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mack Smith"
                className="w-full pl-9 pr-4 py-[9px] text-[16px] text-[#41463B] font-[500] placeholder-[#41463B] placeholder:font-[400] border border-[#20231E] bg-[#F1F2F0] focus:bg-[#ffffff] hover:bg-[#D3D6D1]  rounded-lg shadow-[0_0_8px_-2px_#1A1A1A1F]  focus:outline-none  transition-all duration-500"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-[#20231E] mb-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <img src="/email-dark.svg" alt="" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mack100@gmail.com"
                className="w-full pl-9 pr-4 py-[9px] text-[16px] text-[#41463B] font-[500] placeholder-[#41463B] placeholder:font-[400] border border-[#20231E] bg-[#F1F2F0] focus:bg-[#ffffff] hover:bg-[#D3D6D1]  rounded-lg shadow-[0_0_8px_-2px_#1A1A1A1F]  focus:outline-none  transition-all duration-500"
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
                <img src="/password-dark.svg" alt="" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="aL4652523#"
                className="w-full pl-9 pr-4 py-[9px] text-[16px] text-[#41463B] font-[500] placeholder-[#41463B] placeholder:font-[400] border border-[#20231E] bg-[#F1F2F0] focus:bg-[#ffffff] hover:bg-[#D3D6D1]  rounded-lg shadow-[0_0_8px_-2px_#1A1A1A1F]  focus:outline-none  transition-all duration-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                    {showPassword ? (
                    <img src="/eye-line.svg" alt="" />
                  ) : (
                    <img src="/eye-close.svg" alt="" />
                  )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-[#20231E] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <img src="/password-dark.svg" alt="" />

              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="aL4652523#"
                className="w-full pl-9 pr-4 py-[9px] text-[16px] text-[#41463B] font-[500] placeholder-[#41463B] placeholder:font-[400] border border-[#20231E] bg-[#F1F2F0] focus:bg-[#ffffff] hover:bg-[#D3D6D1]  rounded-lg shadow-[0_0_8px_-2px_#1A1A1A1F]  focus:outline-none  transition-all duration-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
              {showPassword ? (
                    <img src="/eye-line.svg" alt="" />
                  ) : (
                    <img src="/eye-close.svg" alt="" />
                  )
              }
              </button>
            </div>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-[8px] bg-[#6C7463] text-white py-3 font-[600] rounded-full  hover:bg-[#565D4F] transition-colors  cursor-pointer transition-all duration-500"
          >
            {loading ? 'Creating account...' : 'Signup'}
          </button>

          {/* Error/Success Message */}
          {message && (
            <p className={`text-sm text-center ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-[#83857D] font-[500] placeholder:font-[400] mb-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4B544A] hover:text-[#20231E] font-[600] underline hover:underline transition-all duration-500">
              Login
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

          {/* Google Signup Button */}
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
