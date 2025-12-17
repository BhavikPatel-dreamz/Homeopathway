'use client'
import React, { useState } from 'react'
import FAQItem from './FAQItem'

const FAQS = [
  {
    q: 'Is homeopathy safe?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
  {
    q: 'How do I know which remedy to choose?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
  {
    q: 'How long does it take for a remedy to work?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
  {
    q: 'Can I take a remedy while on medication?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
  {
    q: 'Can children take homeopathic remedies?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
  {
    q: 'Does HomeoPathway give medical advice?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
]

export default function FAQCard() {
  const [openIndex, setOpenIndex] = useState<number | null>(1)

  return (
    <section
      className="bg-[#F5F1E8] pt-3 pb-[40px] bg-[#F5F1E8]">
      <div className="max-w-[1268px] mx-auto px-4" >
        <div className="bg-white rounded-[8px] border-0 md:p-6 p-4">
          {/* TITLE */}
          <h1 className="font-sans md:text-[40px] text-[36px] md:leading-[44px] leading-48px font-normal text-[#0B0C0A] mb-4">
            FAQ
          </h1>

          {/* SUBTITLE */}
          <p className="text-[#41463B] text-[16px] leading-[24px] font-medium">
            If you are new to homeopathy, here are simple steps to help you begin.
          </p>

          {/* FAQ LIST */}
          <div className="flex flex-col">
            {FAQS.map((item, index) => (
              <FAQItem
                key={index}
                question={item.q}
                answer={item.a}
                isOpen={openIndex === index}
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
