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

    // ✅ IMPORTANT FIX: GO TO OTP PAGE
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
        className="w-full border rounded-md px-3 py-2 mb-4 text-[#0B0C0A]"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#6B705C] text-white py-2 rounded-full mb-4"
      >
        Send OTP
      </button>

      <p className="text-xs text-[#6B6F63]">
        Remembered your password?{' '}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </AuthCard>
  )
}
