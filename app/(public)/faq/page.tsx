import Breadcrumb from '@/components/Breadcrumb'
import FAQCard from '@/components/FAQCard'
import React from 'react'

export default function Page() {
  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'FAQ', isActive: true },
        ]}
      />

      <FAQCard />
    </div>
  )
}
