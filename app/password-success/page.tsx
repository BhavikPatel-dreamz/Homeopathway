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
          w-full h-[40px]
          bg-[#6B705C]
          text-white
          rounded-full
          flex items-center justify-center
          text-[14px]
        "
      >
        Back to Login
      </Link>
    </AuthCard>
  )
}
