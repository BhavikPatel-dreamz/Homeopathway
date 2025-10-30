"use client";

import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#4B544A] text-white px-6 py-12">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <svg viewBox="0 0 40 60" className="w-10 h-14">
              <g transform="translate(20, 10)">
                <ellipse cx="-6" cy="-2" rx="4" ry="7" fill="white" transform="rotate(-30 -6 -2)"/>
                <ellipse cx="6" cy="-2" rx="4" ry="7" fill="white" transform="rotate(30 6 -2)"/>
                <ellipse cx="-8" cy="3" rx="3.5" ry="6" fill="white" transform="rotate(-40 -8 3)"/>
                <ellipse cx="8" cy="3" rx="3.5" ry="6" fill="white" transform="rotate(40 8 3)"/>
                <ellipse cx="-5" cy="8" rx="3" ry="5" fill="white" transform="rotate(-25 -5 8)"/>
                <ellipse cx="5" cy="8" rx="3" ry="5" fill="white" transform="rotate(25 5 8)"/>
                <line x1="0" y1="10" x2="0" y2="35" stroke="white" strokeWidth="2"/>
                <path d="M -2 15 Q -5 18 -3 21 Q -1 24 -4 27 Q -6 30 -2 33" 
                      stroke="white" strokeWidth="2.5" fill="none"/>
                <circle cx="-2" cy="14" r="1.5" fill="white"/>
              </g>
            </svg>
            <div>
              <div className="text-xl font-serif tracking-wide">HOMEOPATHWAY</div>
              <div className="text-[10px] text-gray-300 tracking-widest">YOUR PATH TO HEALING</div>
            </div>
          </div>
          <p className="text-gray-300 text-sm max-w-md">
            Your trusted guide to natural homeopathic healing. Find remedies, read reviews and take charge of your health.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">About Homeopathy</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white">What is Homeopathy?</a></li>
            <li><a href="#" className="hover:text-white">How it Works</a></li>
            <li><a href="#" className="hover:text-white">Safety & Research</a></li>
            <li><a href="#" className="hover:text-white">Getting Started</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Safety Guidelines</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-300">© 2025 Homeopathway. All Rights Reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <span className="text-sm">f</span>
          </a>
          <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <span className="text-sm">𝕏</span>
          </a>
          <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <span className="text-sm">in</span>
          </a>
          <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <span className="text-sm">▶</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
  )
}


