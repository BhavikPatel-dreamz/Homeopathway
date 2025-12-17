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
      <div className="relative mt-5 mb-5">
        <label className="block text-left text-[14px] text-[#20231E] font-medium mb-2">
          New Password
        </label>
        {/* LOCK ICON */}
        {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6F63]" /> */}
        <img
            src={show ? '/lock.svg' : '/lock.svg'}
            alt="lock icon"
            className="absolute left-3 top-10.5 w-4 h-4 text-[#6B6F63]"
          />

        <input
          type={show ? 'text' : 'password'}
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
          onClick={() => setShow(!show)}
          className="absolute right-3 top-10.5"
        >
          <img
            src={show ? '/eye-close.svg' : '/eye-line.svg'}
            alt="toggle password visibility"
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="relative">
        <label className="block text-left text-[14px] text-[#20231E] font-medium mb-2">
          Confirm Password
        </label>
        {/* LOCK ICON */}
        {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6F63]" /> */}
        <img
            src={show ? '/lock.svg' : '/lock.svg'}
            alt="lock icon"
            className="absolute left-3 top-10.5 w-4 h-4 text-[#6B6F63]"
          />

        <input
          type={show ? 'text' : 'password'}
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
          onClick={() => setShow(!show)}
          className="absolute right-3 top-10.5"
        >
          <img
            src={show ? '/eye-close.svg' : '/eye-line.svg'}
            alt="toggle password visibility"
            className="w-4 h-4"
          />
        </button>
      </div>

      {/* HELPER TEXT */}
      <p className="text-[12px] text-[#41463B] font-normal leading-[20px] text-left max-w-[297px] mt-2">
          Minimum 8 character, at least one special character, one number
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
          disabled:opacity-60
          hover:bg-[#5A5E4F]
          cursor-pointer
          mt-5
          mx-auto
          transition: background-color 0.3s ease-in-out
        "
      >
        Set New Password
      </button>
    </AuthCard>
  )
}
