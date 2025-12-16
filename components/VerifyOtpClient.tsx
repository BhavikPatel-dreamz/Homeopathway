'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyOtpClient() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const router = useRouter()

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  async function verify() {
    const token = otp.join('')

    if (token.length !== 6) {
      alert('Please enter the 6-digit code')
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email', // ✅ unchanged
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/reset-password')
  }

  function handleChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return

    const updated = [...otp]
    updated[index] = value
    setOtp(updated)

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  return (
    <AuthCard
      title="Verify Code"
      subtitle={`We sent a code to ${email}`}
    >
      {/* OTP INPUTS */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            inputMode="numeric"
            className="
        w-[40px] h-[44px]
        border border-[#0B0C0A]
        rounded-md
        text-center
        text-[16px]
        text-[#0B0C0A]
        focus:outline-none
      "
          />
        ))}
      </div>


      <button
        onClick={verify}
        className="
          w-full h-[40px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[14px]
          font-medium
        "
      >
        Continue
      </button>

      <p className="text-[12px] text-[#6B6F63]">
        Didn’t receive the email?{' '}
        <span className="underline cursor-pointer">
          Click to resend
        </span>
      </p>
    </AuthCard>
  )
}
