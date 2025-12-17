import AuthCard from '@/components/AuthCard'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <AuthCard
      title="All Done!"
      subtitle="Your password has been reset successfully"
    >
      <Link
        href="/login"
        className="
          w-full h-[44px]
          bg-[#6B705C]
          text-white
          rounded-full
          text-[16px]
          leading-[44px]
          font-semibold
          disabled:opacity-60
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
