import React from 'react'

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen bg-[#F5F3ED] flex items-center justify-center px-4">
      <div
        className="
          bg-white
          w-full max-w-[448px]
          rounded-[12px]
          sm:px-[40px] sm:py-[50px]
          px-[16px] py-[30px]
          text-center
        "
      >
        {/* LOGO */}
        <img
          src="/login-logo.svg"
          alt="logo"
          className="mx-auto w-[106px] h-[118px] text-[#0B0C0A] "
        />


        {/* TITLE */}
        <h1 className="font-serif text-[32px] leading-[40px] font-normal text-[#0B0C0A] mb-2">
          {title}
        </h1>

        {/* SUBTITLE */}
        {subtitle && (
          <p className="text-[16px] leading-6 text-[#41463B] mb-5 font-medium sm:max-w-[368px] max-w-full mx-auto">
            {subtitle}
          </p>
        )}

        {/* CONTENT */}
        <div className="flex flex-col">
          {children}
        </div>
      </div>
    </section>
  )
}
