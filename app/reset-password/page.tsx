'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

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
    if (error) {
      alert(error.message)
      return
    }

    router.push('/password-success')
  }

  return (
    <AuthCard title="Set New Password">
      
      {/* NEW PASSWORD */}
      <div className="relative">
        {/* LOCK ICON */}
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6F63]" />

        <input
          type={show ? 'text' : 'password'}
          placeholder="New Password"
          className="
            w-full h-[40px]
            border border-[#E6E4DC]
            rounded-md
            pl-9 pr-9
            text-[14px]
            text-[#0B0C0A]
            placeholder:text-[#9B9F94]
            focus:outline-none
          "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* EYE ICON */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <img
            src={show ? '/eye-close.svg' : '/eye-line.svg'}
            alt="toggle password visibility"
            className="w-4 h-4 opacity-70"
          />
        </button>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="relative">
        {/* LOCK ICON */}
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6F63]" />

        <input
          type={show ? 'text' : 'password'}
          placeholder="Confirm Password"
          className="
            w-full h-[40px]
            border border-[#E6E4DC]
            rounded-md
            pl-9 pr-9
            text-[14px]
            text-[#0B0C0A]
            placeholder:text-[#9B9F94]
            focus:outline-none
          "
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {/* HELPER TEXT */}
      <p className="text-[12px] text-[#6B6F63] text-left">
        Minimum 8 characters, at least one number
      </p>

      {/* SUBMIT */}
      <button
        onClick={submit}
        className="
          w-full h-[40px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[14px]
          font-medium
        "
      >
        Set New Password
      </button>
    </AuthCard>
  )
}
