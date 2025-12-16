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
      className="
        flex justify-center
        bg-[#F5F1E8]
        px-[16px] pt-[8px] pb-[24px]
        md:px-[96px] md:pt-[12px] md:pb-[40px]
      "
    >
      <div
        className="
          bg-white border border-[#EDECE7] rounded-[16px]
          w-full max-w-[368px] p-[16px]
          md:max-w-[1248px] md:p-[24px]
        "
      >
        <div
          className="
            w-full
            md:w-[1200px] md:mx-auto
            flex flex-col gap-[24px]
          "
        >
          {/* TITLE */}
          <h1 className="font-serif text-[#0B0C0A] text-[28px] leading-[32px] md:text-[32px] md:leading-[36px]">
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
