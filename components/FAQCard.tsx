'use client'
import React, { useState } from 'react'
import FAQItem from './FAQItem'

const FAQS = [
  {
    q: 'Is homeopathy safe?',
    a: 'Homeopathic remedies are widely regarded as safe because of their high dilutions and long history of use around the world. Many people use them for mild, everyday concerns, while emergencies and serious medical conditions require professional medical care.',
  },
  {
    q: 'How do I know which remedy to choose?',
    a: 'You can explore remedies commonly used by other people with similar symptoms and read their experiences on HomeoPathway.',
  },
  {
    q: 'How long does it take for a remedy to work?',
    a: 'Some people report improvement within hours, while others notice changes over several days. It depends on the condition and the person.',
  },
  {
    q: 'Can I take a remedy while on medication?',
    a: 'Homeopathic remedies rarely interact with medications, but it is always wise to ask a healthcare professional if you are unsure.',
  },
  {
    q: 'Can children take homeopathic remedies?',
    a: 'Many remedies are used for children, but it is best to follow professional guidance and use appropriate potencies.',
  },
  {
    q: 'What potency should I use?',
    a: 'Beginners often start with 6C, 12C, or 30C. Potency choice can vary depending on symptom intensity and personal preference.',
  },
  {
    q: 'Does HomeoPathway give medical advice?',
    a: 'No, we provide community insights and structured information. For diagnosis or treatment decisions, consult a qualified healthcare professional.',
  },
]

export default function FAQCard() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)


  return (
    <section
      className="bg-[#F5F1E8] pt-3 pb-[40px] bg-[#F5F1E8]">
      <div className="max-w-[1268px] mx-auto px-4" >
        <div className="bg-white rounded-[8px] border-0 md:p-6 p-4">
          {/* TITLE */}
          <h1 className="font-sans md:text-[40px] text-[36px] md:leading-[44px] leading-48px font-normal text-[#0B0C0A] mb-4">
            FAQ
          </h1>

          {/* SUBTITLE (removed) */}

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
