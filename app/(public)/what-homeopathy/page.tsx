// app/page.js
import React from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import HomeopathyCard from '@/components/HomeopathyCard' // Import the new card component

export default function HomeopathyPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "What-is-Homeopathy", isActive: true } // Corrected label for better readability
        ]}
      />

      {/* Main Content Card */}
      <HomeopathyCard />
    </div>
  )
}