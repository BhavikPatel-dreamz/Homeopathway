// app/contact-us/page.tsx (or equivalent page file)

import Breadcrumb from '@/components/Breadcrumb'
import ContactUsSection from '@/components/ContactUsSection'
import React from 'react'

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Breadcrumb */}
      <div className="pt-4 px-4 max-w-[1248px] mx-auto">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact Us', isActive: true },
          ]}
        />
      </div>

      {/* Main Content */}
      <main className="px-4 py-8 md:py-12">
        <ContactUsSection />
      </main>
    </div>
  )
}