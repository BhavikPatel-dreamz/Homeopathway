"use client"
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top on route change
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [pathname])

  return null
}
