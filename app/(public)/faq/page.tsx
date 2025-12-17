import Breadcrumb from '@/components/Breadcrumb'
import FAQCard from '@/components/FAQCard'
import React from 'react'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] ">
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
