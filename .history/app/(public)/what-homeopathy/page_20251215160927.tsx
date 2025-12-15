// app/page.js
import React from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Footer from '@/components/Footer' // Import Footer if it's not already globally included
import HomeopathyCard from '@/components/HomeopathyCard' // Import the new card component

export default function HomeopathyPage() {
  return (

    // Use a background color consistent with the image's body background
    <div className="min-h-screen bg-[#F5F1E8]">
              {/* Header (Placeholder for a navigation bar, not explicitly provided but implied) */}
              {/* You would place your Header/Nav component here */}
              
              {/* Breadcrumb */}
              <Breadcrumb 
                items={[
                  { label: "Home", href: "/" },
                  { label: "About", href: "/about" }, // Added 'About' as per the image's breadcrumb
                  { label: "What is Homeopathy?", isActive: true } // Corrected label for better readability
                ]}
              />

            {/* Main Content Card */}
            <HomeopathyCard />

            {/* Footer */}
            <Footer />
    </div>
  )
}