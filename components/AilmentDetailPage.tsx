"use client";
import React, { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "./Header";

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

export default function 
AilmentDetailPage({ ailment, remedies }: AilmentDetailPageProps) {
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
     <Header />

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
              <Link href={`/remedies/${remedy.id}`} key={remedy.id}>
                <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
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
              </Link>
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
            <Footer/>
    </div>
  );
}