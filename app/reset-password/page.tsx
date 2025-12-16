'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const router = useRouter()

  async function submit() {
    if (password !== confirm) {
      alert('Passwords do not match')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return alert(error.message)

    router.push('/password-success')
  }

  return (
    <AuthCard title="Set New Password">
      {/* PASSWORD */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6F63]" />
        <input
          type={show ? 'text' : 'password'}
          placeholder="New Password"
          className="w-full h-[40px] border rounded-md pl-9 pr-9 text-[14px]"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* CONFIRM */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6F63]" />
        <input
          type={show ? 'text' : 'password'}
          placeholder="Confirm Password"
          className="w-full h-[40px] border rounded-md pl-9 pr-9 text-[14px]"
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <p className="text-[12px] text-[#6B6F63] text-left">
        Minimum 8 characters, at least one number
      </p>

      <button
        onClick={submit}
        className="
          w-full h-[40px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[14px]
        "
      >
        Set New Password
      </button>
    </AuthCard>
  )
}
