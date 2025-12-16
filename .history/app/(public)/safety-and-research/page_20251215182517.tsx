// src/app/page.tsx (or the file where you render the page)
import Breadcrumb from '@/components/Breadcrumb'
import SafetyCard from '@/components/SafetyCard'
import React from 'react'

export default function SafetyAndResearchPage() {
  return (
    // Page Layout: min-h-screen, bg-[#F5F1E8], padding-top: 12px, padding-bottom: 40px
    // Padding: padding-right: 96px, padding-left: 96px (equivalent to px-24 or px-[96px] in Tailwind)
    <div className="min-h-screen bg-[#F5F1E8]">
         
         {/* Breadcrumb */}
         <Breadcrumb 
           items={[
             { label: "Back to home", href: "/" },
             { label: "Safety & Research", isActive: true }
           ]} 
         />
         
       {/* Main Content Container with Page Padding */}
       <div className="px-6 lg:px-24 pt-3 pb-10"> 
       
         {/* Header/Title Section */}
         <section className="bg-[#f5f3ed] py-10 mb-6 rounded-xl"> 
           <div className="max-w-7xl mx-auto text-center">

           </div>
         </section>
         
         {/* Safety Card Component */}
         <SafetyCard />
         
       </div>
   

    </div>
  )
}