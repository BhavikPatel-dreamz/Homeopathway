'use client'

import { useEffect } from 'react'
import AuthCard from '@/components/AuthCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if the user actually completed the reset password step
    const flow = sessionStorage.getItem('passwordResetFlow')
    
    if (flow !== 'success_reached') {
      // If they didn't finish the process, send them back to the start
      router.push('/forgot-password')
    }
  }, [router])

  const handleBackToLogin = () => {
    // Clear the flow state only when they officially leave this success screen
    sessionStorage.removeItem('passwordResetFlow')
  }

  return (
    <AuthCard
      title="All Done!"
      subtitle="Your password has been reset successfully"
    >
      <Link
        href="/login"
        onClick={handleBackToLogin}
        className="
          block text-center
          w-full h-[44px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[16px]
          leading-[44px]
          font-semibold
          hover:bg-[#5A5E4F]
          cursor-pointer
          transition: background-color 0.3s ease-in-out
        "
      >
        Back to Login
      </Link>
    </AuthCard>
  )
}