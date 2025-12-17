'use client'
import React from 'react'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}

export default function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: FAQItemProps) {
  return (
    <div
      className={`
        border-b border-[#D9D7D0] last:border-b-0 cursor-pointer
        ${isOpen ? 'bg-[#F7F4EC] rounded-[8px] p-4 mt-5 border-b-0' : 'py-4'}
        transition-all duration-300
      `}
    >
      {/* QUESTION */}
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <span className="text-[#0B0C0A] font-semibold text-[16px] leading-[24px]">
          Q: {question}
        </span>

        <span className="text-[22px] font-light text-[#0B0C0A]">
          {isOpen ? '–' : '+'}
        </span>
      </button>

      {/* ANSWER */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-[200px] opacity-100 mt-3' : 'max-h-0 opacity-0'}
        `}
      >
        <p className="text-[#41463B] text-[16px] leading-[24px] font-medium">
          {answer}
        </p>
      </div>
    </div>
  )
}
