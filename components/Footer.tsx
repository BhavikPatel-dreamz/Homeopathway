"use client";

import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#4B544A] text-white px-4 py-6 lg:py-10">
    <div className="max-w-7xl px-0 lg:px-5 mx-auto">
      <div className="grid grid-cols-12 gap-6 lg:gap-8 md:mb-5 lg:mb-6">
        <div className="col-span-12 md:col-span-6 lg:col-span-7 flex items-center">
          <div className="flex items-start lg:items-center gap-3  flex-col lg:flex-row">
            <div className='mb-3 w-26 h-28 md:w-39 md:h-39 lg:w-40 lg:h-40 '>
              <a href="/">
                <img className="object-contain w-full h-full" src="/home-banner-logo.svg" alt="" />
              </a>
            </div>
            <div>
              <p className="text-[#D3D6D1] font-[500] max-w-[380px]">Your trusted guide to natural homeopathic healing, connecting you with remedies that work.</p>
            </div>
          </div>
        </div>

        <div  className="col-span-12 md:col-span-3 lg:col-span-3">
          <p className="text-[#fff] text-[16px] font-[600] mb-5 ">About</p>
          <ul className="space-y-4 text-sm text-gray-300">
            <li><a href="/what-homeopathy" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">What is Homeopathy?</a></li>
            <li><a href="/how-it-works" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">How it Works</a></li>
            <li><a href="/safety-and-research" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">Safety & Research</a></li>
            <li><a href="/getting-started" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">Getting Started</a></li>
          </ul>
        </div>

        <div className="col-span-12 md:col-span-3 lg:col-span-2">
        <p className="text-[#fff] text-[16px] font-[600] mb-5 ">Support</p>
          <ul className="space-y-4 text-sm text-gray-300">
            <li><a href="/contact-us" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">Contact Us</a></li>
            <li><a href="/help-center" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">Help Center</a></li>
            <li><a href="/safety-guidelines" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">Safety Guidelines</a></li>
            <li><a href="/faq" className="text-[#C4C7C1] font-[600] hover:text-[#fff] hover:text-[15px] transition-all duration-500">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#A7ACA1] mt-5 pt-5 flex flex-col md:flex-row justify-between flex-col-reverse items-start lg:items-center gap-4">
        <p className="text-[12px] text-[#D3D6D1] font-[500]">© 2025 Homeopathway. All Rights Reserved.</p>
        <div className="flex items-center gap-4">
          <div className="text-[#D3D6D1] font-[500]">Follow Us</div>
          <a href="https://www.facebook.com" target="_blank" className="w-6 h-6">
            <img className="w-full h-full object-contain hover:opacity-50 transition-all duration-500" src="/facebook.svg" alt="" />
          </a>
          <a href="https://x.com" target="_blank" className="w-6 h-6 ">
            <img className="w-full h-full object-contain hover:opacity-50 transition-all duration-500" src="/x.svg" alt="" />
          </a>
          <a href="https://www.instagram.com" target="_blank" className="w-6 h-6">
            <img className="w-full h-full object-contain hover:opacity-50 transition-all duration-500" src="/instagram.svg" alt="" />
          </a>
          <a href="https://www.youtube.com" target="_blank" className="w-6 h-6">
            <img className="w-full h-full object-contain hover:opacity-50 transition-all duration-500" src="/youtube.svg" alt="" />
          </a>
        </div>
      </div>
    </div>
  </footer>
  )
}


