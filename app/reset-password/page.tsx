'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthCard from '@/components/AuthCard'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

      {/* ================= NEW PASSWORD ================= */}
      <div className="relative mt-5 mb-5">
        <label className="block text-left text-[14px] text-[#20231E] font-medium mb-2">
          New Password
        </label>

        {/* LOCK ICON */}
        <img
          src="/lock.svg"
          alt="lock icon"
          className="absolute left-3 top-10.5 w-4 h-4"
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="New Password"
          className="
            w-full h-[44px]
            border border-[#20231E]
            pl-9 pr-9
            text-[14px]
            text-[#0B0C0A]
            placeholder:text-[#41463B]
            focus:outline-none
            bg-white
            rounded-[8px]
          "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* EYE ICON */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-10.5"
        >
          <img
            src={showPassword ? '/eye-close.svg' : '/eye-line.svg'}
            alt="toggle password visibility"
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* ================= CONFIRM PASSWORD ================= */}
      <div className="relative">
        <label className="block text-left text-[14px] text-[#20231E] font-medium mb-2">
          Confirm Password
        </label>

        {/* LOCK ICON */}
        <img
          src="/lock.svg"
          alt="lock icon"
          className="absolute left-3 top-10.5 w-4 h-4"
        />

        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm Password"
          className="
            w-full h-[44px]
            border border-[#20231E]
            pl-9 pr-9
            text-[14px]
            text-[#0B0C0A]
            placeholder:text-[#41463B]
            focus:outline-none
            bg-white
            rounded-[8px]
          "
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {/* EYE ICON */}
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-10.5"
        >
          <img
            src={showConfirm ? '/eye-close.svg' : '/eye-line.svg'}
            alt="toggle confirm password visibility"
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* HELPER TEXT */}
      <p className="text-[12px] text-[#41463B] leading-[20px] text-left max-w-[297px] mt-2">
        Minimum 8 characters, at least one special character and one number
      </p>

      {/* SUBMIT */}
      <button
        onClick={submit}
        className="
          w-full h-[44px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[16px]
          font-semibold
          hover:bg-[#5A5E4F]
          mt-5
          transition
        "
      >
        Set New Password
      </button>

    </AuthCard>
  )
}
