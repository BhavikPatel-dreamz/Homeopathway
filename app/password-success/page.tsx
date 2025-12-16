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
        className="block w-full bg-[#6B705C] text-white py-2 rounded-full text-center"
      >
        Back to Login
      </Link>
    </AuthCard>
  )
}
