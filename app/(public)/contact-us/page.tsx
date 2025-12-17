// app/contact-us/page.tsx (or equivalent page file)

import Breadcrumb from '@/components/Breadcrumb'
import ContactUsSection from '@/components/ContactUsSection'
import React from 'react'

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact Us', isActive: true },
          ]}
        />

      {/* Main Content */}
      <main>
        <ContactUsSection />
      </main>
    </div>
  )
}