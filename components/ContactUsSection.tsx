// components/ContactUsSection.tsx

'use client'

import Image from 'next/image'
import { useState } from 'react'
import React from 'react'

export default function ContactUsSection() {
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // console.log('Message submitted:', message)
    alert('Form submitted (API hookup later)')
    setMessage('')
  }

  return (
    // Main Section Container: Background is WHITE.
    // Padding: p-4 for mobile (~16px), md:p-10 for desktop.
    <section
      className="bg-[#F5F1E8] pt-3 pb-[40px] bg-[#F5F1E8]"
    >
      {/* Grid: gap-4 for mobile (16px), lg:gap-8 for desktop (32px) */}
      <div className='max-w-[1268px] mx-auto px-4'>
        <div className="bg-white rounded-[8px] border-0 md:p-6 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start">
          
          {/* LEFT CONTENT: Form and Contact Info */}
          {/* The gap-8 controls the space between the Title/Info block and the Form block */}
          <div className="flex flex-col gap-8"> 
            
            {/* TOP BLOCK: Title and Contact Info */}
            <div>
              {/* Title */}
              <h1 className="font-sans md:text-[40px] text-[36px] md:leading-[44px] leading-48px font-normal text-[#0B0C0A] mb-3">
                Contact Us
              </h1>

              {/* 1. Intro Text: Separated to control spacing below it */}
              <p className="text-[14px] text-[#41463B] mb-3"> {/* mb-3 provides visual space before emails */}
                We are happy to hear from you.
              </p>

              {/* 2 & 3. CONTACT INFO: Tighter spacing for the two email lines */}
              <div className="text-[14px] text-[#41463B] space-y-2"> {/* space-y-2 for spacing between email lines */}
                <p className="leading-5"> 
                  <span className="font-medium text-[#0B0C0A]">Email:</span>{' '}
                  hello@homeopathway.com
                </p>
                <p className="leading-5"> 
                  <span className="font-medium text-[#0B0C0A]">
                    Business Inquiries:
                  </span>{' '}
                  partnerships@homeopathway.com
                </p>
              </div>
            </div>
            
            {/* FORM BLOCK */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Label */}
              <label className="text-[14px] text-[#0B0C0A] font-medium">
                Feedback Form
              </label>

              {/* Textarea: Background is cream color #F7F4EC */}
              <textarea
                rows={5} 
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="
                  w-full
                  border border-[#E6E4DC]
                  rounded-[8px]
                  px-3 py-2
                  text-[14px]
                  text-[#0B0C0A]
                  placeholder:text-[#9B9F94]
                  resize-none
                  focus:outline-none
                  focus:ring-2 focus:ring-[#6B705C]/40
                  bg-[#F1F2F0] {/* Textarea background: Cream color */}
                "
                style={{ minHeight: '120px' }} 
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="
                  w-fit
                  bg-[#6C7463] 
                  text-white
                  text-[16px]
                  font-semibold
                  px-6
                  py-[10px] 
                  rounded-full 
                  hover:opacity-90
                  transition-opacity
                  mt-1 
                  cursor-pointer
                  sm:max-w-[157px]
                  w-full
                "
              >
                Submit Form
              </button>

              {/* Response Time Info */}
              <p className="text-[14px] leading-[28px] font-medium text-[#83857D]">
                Typical Response Time: 1–2 business days
              </p>
            </form>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-full h-full">
            {/* Image Container: Fixed height (336px) and rounded corners (16px) */}
            <div className="relative w-full h-[336px] rounded-[8px] overflow-hidden">
              <Image
                src="/contactus.png"
                alt="Contact Us"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}