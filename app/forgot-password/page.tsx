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
      <input
        type="email"
        placeholder="Enter your email"
        className="
          w-full h-[40px]
          border border-[#E6E4DC]
          rounded-md
          px-3
          text-[14px]
          text-[#0B0C0A]
          placeholder:text-[#9B9F94]
        "
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="
          w-full h-[40px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[14px]
          font-medium
          disabled:opacity-60
        "
      >
        Continue
      </button>

      <p className="text-[12px] text-[#6B6F63]">
        Did you remember the password?{' '}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </AuthCard>
  )
}
