'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const router = useRouter()

  async function submit() {
    if (!password || password.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    if (password !== confirm) {
      alert('Passwords do not match')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      alert(error.message)
      return
    }

    router.push('/password-success')
  }

  return (
    <AuthCard title="Set New Password">
      <input
        type="password"
        placeholder="New Password"
        className="w-full border rounded-md px-3 py-2 mb-3 text-[#0B0C0A]"
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full border rounded-md px-3 py-2 mb-4 text-[#0B0C0A]"
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        onClick={submit}
        className="w-full bg-[#6B705C] text-white py-2 rounded-full"
      >
        Set New Password
      </button>
    </AuthCard>
  )
}
