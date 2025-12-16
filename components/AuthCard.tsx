import React from 'react'

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen bg-[#F5F3ED] flex items-center justify-center px-4">
      <div
        className="
          bg-white
          w-full max-w-[448px]
          rounded-[24px]
          px-[40px] py-[48px]
          flex justify-center
        "
      >
        {/* INNER LAYOUT */}
        <div className="w-full max-w-[368px] flex flex-col gap-[24px] text-center">
          
          {/* LOGO */}
          <img
            src="/banner-home.svg"
            alt="logo"
            className="mx-auto w-[106px] h-[118px]"
            style={{ filter: 'invert(1)' }} // forces black SVG
          />

          {/* TITLE */}
          <h1 className="font-serif text-[24px] leading-[32px] text-[#0B0C0A]">
            {title}
          </h1>

          {/* SUBTITLE */}
          {subtitle && (
            <p className="text-[14px] leading-[20px] text-[#6B6F63]">
              {subtitle}
            </p>
          )}

          {/* CONTENT */}
          <div className="flex flex-col gap-[16px]">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
