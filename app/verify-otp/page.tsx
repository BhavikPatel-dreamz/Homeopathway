import { Suspense } from 'react'
import VerifyOtpClient from '@/components/VerifyOtpClient'

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpClient />
    </Suspense>
  )
}
