'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push(`/verify-otp?email=${email}`)
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter the email address associated with your account"
    >
      <label className="block text-[14px] text-[#20231E] font-medium text-left">Email</label>
      <div className='inputWithIcon relative mt-2 mb-5'>
        <input
          type="email"
          placeholder="Enter your email"
          className="
            w-full h-[44px]
            border 
            border-[#D3D6D1]
            rounded-md
            pr-3
            pl-10
            text-[16px]
            text-[#41463B]
            bg-[#F1F2F0]
            font-normal
            placeholder:text-[#41463B]
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span className='inputIcon absolute left-4 top-4 right-auto'>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none">
            <path d="M0.666667 0H12.6667C12.8435 0 13.013 0.0702379 13.1381 0.195262C13.2631 0.320286 13.3333 0.489856 13.3333 0.666667V11.3333C13.3333 11.5101 13.2631 11.6797 13.1381 11.8047C13.013 11.9298 12.8435 12 12.6667 12H0.666667C0.489856 12 0.320286 11.9298 0.195262 11.8047C0.0702379 11.6797 0 11.5101 0 11.3333V0.666667C0 0.489856 0.0702379 0.320286 0.195262 0.195262C0.320286 0.0702379 0.489856 0 0.666667 0ZM12 2.82533L6.71467 7.55867L1.33333 2.81067V10.6667H12V2.82533ZM1.674 1.33333L6.70733 5.77467L11.668 1.33333H1.674Z" fill="#A7ACA1"/>
          </svg>
        </span>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="
          w-full h-[44px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[16px]
          font-semibold
          disabled:opacity-60
          hover:bg-[#5A5E4F]
          cursor-pointer
          transition: background-color 0.3s ease-in-out
        "
      >
        Continue
      </button>

      <p className="text-[14px] leading-[22px] text-[#83857D] font-medium mt-3">
        Did you remember the password?{' '}
        <Link href="/login" className="underline text-[#4B544A] font-semibold hover:text-[#6B705C] cursor-pointer">
          Login
        </Link>
      </p>
    </AuthCard>
  )
}
