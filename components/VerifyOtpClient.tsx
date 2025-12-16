'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyOtpClient() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [otp, setOtp] = useState('')
  const router = useRouter()

  async function verify() {
    if (otp.length !== 6) {
      alert('Please enter the 6-digit code')
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email', // ✅ unchanged
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/reset-password')
  }

  return (
    <AuthCard
      title="Verify Code"
      subtitle={`Enter the 6-digit code sent to ${email}`}
    >
      <input
        maxLength={6}
        inputMode="numeric"
        placeholder="••••••"
        className="
          w-full h-[44px]
          border border-[#0B0C0A]
          rounded-md
          text-center
          tracking-[8px]
          text-[18px]
          text-[#0B0C0A]
        "
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button
        onClick={verify}
        className="
          w-full h-[40px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[14px]
        "
      >
        Verify
      </button>
    </AuthCard>
  )
}
