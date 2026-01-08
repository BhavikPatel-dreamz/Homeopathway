import Breadcrumb from '@/components/Breadcrumb'
import React from 'react'

export default function page() {
  return (

    <div className="min-h-screen bg-[#F5F1E8]">
          {/* Header */}
          
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: "Home", href: "/" },
              { label: "How it Works", isActive: true }
            ]} 
          />
        <section className="px-4 p-50  lg:p-70  bg-[#f5f3ed] main-wrapper">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className='text-[30px] md:text-[32px] lg:text-[40px]'>How it Works</h1>
          </div>
        </section>
        </div>
    

  )
}
