"use client";
import React, { useState } from "react";

interface Remedy {
  id: number;
  name: string;
  icon: string;
  color: string;
  indication: string;
  rating: number;
  reviewCount: number;
  ailment: string;
  description: string;
}

interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
  description: string;
  personalizedApproach: string;
}

interface AilmentDetailPageProps {
  ailment: Ailment;
  remedies: Remedy[];
}

export default function AilmentDetailPage({ ailment, remedies }: AilmentDetailPageProps) {
  const [sortBy, setSortBy] = useState("Overall Rating");

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-gray-300'}>
            {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '⯨' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 40 60" className="w-10 h-14">
              <g transform="translate(20, 10)">
                {/* Leaves */}
                <ellipse cx="-6" cy="-2" rx="4" ry="7" fill="#2C5F4F" transform="rotate(-30 -6 -2)"/>
                <ellipse cx="6" cy="-2" rx="4" ry="7" fill="#2C5F4F" transform="rotate(30 6 -2)"/>
                <ellipse cx="-8" cy="3" rx="3.5" ry="6" fill="#2C5F4F" transform="rotate(-40 -8 3)"/>
                <ellipse cx="8" cy="3" rx="3.5" ry="6" fill="#2C5F4F" transform="rotate(40 8 3)"/>
                <ellipse cx="-5" cy="8" rx="3" ry="5" fill="#2C5F4F" transform="rotate(-25 -5 8)"/>
                <ellipse cx="5" cy="8" rx="3" ry="5" fill="#2C5F4F" transform="rotate(25 5 8)"/>
                
                {/* Stem/Staff */}
                <line x1="0" y1="10" x2="0" y2="35" stroke="#2C5F4F" strokeWidth="2"/>
                
                {/* Snake coiled around staff */}
                <path d="M -2 15 Q -5 18 -3 21 Q -1 24 -4 27 Q -6 30 -2 33" 
                      stroke="#2C5F4F" strokeWidth="2.5" fill="none"/>
                <circle cx="-2" cy="14" r="1.5" fill="#2C5F4F"/>
              </g>
            </svg>
            <div>
              <div className="text-xl font-serif tracking-wide">HOMEOPATHWAY</div>
              <div className="text-[10px] text-gray-600 tracking-widest">YOUR PATH TO HEALING</div>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for ailments like 'headache' or 'anxiety' or search for remedies like 'arnica' or 'bella donna'"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Save</span>
            </button>
            <button className="px-6 py-2 border border-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#F5F1E8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Back to home</a>
            <span>/</span>
            <span className="text-gray-900">Headache</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Ailment Header */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-7xl">{ailment.icon}</div>
            <div className="flex-1">
              <h1 className="text-5xl font-serif mb-3">{ailment.name}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="inline-block w-4 h-4">🔬</span>
                <span>{ailment.remedies_count} remedies</span>
              </p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>{ailment.description}</p>
            <p>{ailment.personalizedApproach}</p>
          </div>
        </div>

        {/* Top Remedies Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl">👍</span>
              <h2 className="text-4xl font-serif">Top Remedies</h2>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-700">Sort by:</span>
                <span className="text-sm font-medium">{sortBy}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Remedies List */}
          <div className="space-y-4">
            {remedies.map((remedy, index) => (
              <div key={remedy.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`w-20 h-20 ${remedy.color} rounded-full flex items-center justify-center text-4xl flex-shrink-0`}>
                    {remedy.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-semibold mb-1">{remedy.name}</h3>
                        <p className="text-sm text-gray-600">{remedy.indication}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-serif text-gray-200">#{index + 1}</div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(remedy.rating)}
                      <span className="text-sm text-gray-600">
                        {remedy.rating} ({remedy.reviewCount.toLocaleString()} reviews for {remedy.ailment})
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm leading-relaxed">{remedy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <button className="px-8 py-3 bg-[#2C5F4F] text-white rounded-full hover:bg-[#234838] transition-colors">
              Load More Remedies
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2C5F4F] text-white px-6 py-12 mt-12">
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
    </div>
  );
}