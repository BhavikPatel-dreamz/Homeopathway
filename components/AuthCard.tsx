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
          w-full max-w-[360px]
          rounded-[16px]
          px-6 py-8
          text-center
          shadow-sm
        "
      >
        {/* LOGO */}
        <img
          src="/login-logo.svg"
          alt="logo"
          className="mx-auto w-[106px] h-[118px] text-[#0B0C0A] "
        />


        {/* TITLE */}
        <h1 className="font-serif text-[22px] leading-[28px] text-[#0B0C0A] mb-2">
          {title}
        </h1>

        {/* SUBTITLE */}
        {subtitle && (
          <p className="text-[14px] leading-[20px] text-[#6B6F63] mb-6">
            {subtitle}
          </p>
        )}

        {/* CONTENT */}
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </div>
    </section>
  )
}
