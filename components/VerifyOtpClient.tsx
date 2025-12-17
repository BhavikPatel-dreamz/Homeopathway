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
      title="Forgot Password"
      subtitle={
      <span>
        We sent a code to <span className="font-bold wrap-break-word">{email}</span>
      </span>
    }
    >
      {/* OTP INPUTS */}
      <div className="flex justify-center gap-[10px]">
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
            font-serif
            font-regular
        w-[44px] h-[44px]
        border border-[#B5B6B1]
        rounded-md
        text-center
        text-[20px]
        text-[#0B0C0A]
        focus:outline-none
        focus:border-[#6B705C] focus:border-2
      "
          />
        ))}
      </div>


      <button
        onClick={verify}
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
          mt-5
          max-w-[318px]
          mx-auto
          transition: background-color 0.3s ease-in-out
        "
      >
        Continue
      </button>

      <p className="text-[14px] leading-[22px] text-[#83857D] font-medium mt-3">
        Didn’t receive the email?{' '}
        <span className="underline text-[#4B544A] font-semibold hover:text-[#6B705C] cursor-pointer">
          Click to resend
        </span>
      </p>
    </AuthCard>
  )
}
