"use client";
import React, { useState } from "react";
import Link from "next/link";

interface Remedy {
  id: number;
  name: string;
  slug:string;
  indication: string;
  rating: number; // Renamed from rating
  reviewCount: number; // Renamed from reviewCount
  description: string;
  key_symptoms?: string[];
}

interface TopRemediesProps {
  remedies: Remedy[];
}

export default function TopRemedies({ remedies }: TopRemediesProps) {
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

  const sortedRemedies = [...remedies].sort((a, b) => {
    switch (sortBy) {
      case "Most Reviewed":
        return b.reviewCount - a.reviewCount;
      case "Alphabetical":
        return a.name.localeCompare(b.name);
      case "Overall Rating":
      default:
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // If ratings are equal, sort by review count as a tie-breaker
        return b.reviewCount - a.reviewCount;
    }
  });

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/top-remedies.svg" alt="" className="w-10 h-10 lg:w-12 lg:h-12" />
          <h2 className="text-[28px] lg:text-[40px] text-[#0B0C0A]">Top Remedies</h2>
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center justify-end">
            <label htmlFor="sort-remedies" className="mr-2 font-medium text-gray-700">Sort by:</label>
            <select 
              id="sort-remedies"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block appearance-none bg-transparent text-[#20231E] text-[16px] focus:outline-none pr-6"
            >
              <option>Overall Rating</option>
              <option>Most Reviewed</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Remedies List */}
      <div className="space-y-2.5 mb[10px]">
        {sortedRemedies.map((remedy, index) => (
          <Link href={`/remedies/${remedy.slug}`} key={remedy.slug}>
            <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200 mb-[10px]">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Icon */}
                <div className="w-16 h-16 bg-[#F9F7F2] rounded-full flex items-center justify-center text-4xl flex-shrink-0">
                  🌿
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl text-[#0B0C0A] font-semibold">{remedy.name}</h3>
                      <p className="text-base text-[#41463B]">{remedy.indication}</p>
                    </div>
                    <div className="hidden sm:block text-right text-5xl font-serif text-[#B8A67E] opacity-75">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(remedy.rating)}
                    <span className="text-sm text-[#41463B]">
                      {typeof remedy.rating === 'number' ? remedy.rating.toFixed(1) : 'N/A'} ({remedy.reviewCount} reviews)
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{remedy.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Load More */}
      <div className="mt-8 text-center">
        <Link href="/remedies" className="bg-[#6C7463] text-white px-20 py-3 font-[600] rounded-full hover:bg-[#565D4F] transition-colors cursor-pointer duration-500">
          View all Remedies
        </Link>
      </div>
    </div>
  );
}