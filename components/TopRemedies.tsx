"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Remedy {
  id: string;
  name: string;
  slug:string;
  icon:string;
  indication: string;
  rating: number; // Renamed from rating
  reviewCount: number; // Renamed from reviewCount
  description: string;
  key_symptoms?: string[];
}

interface TopRemediesProps {
  remedies: Remedy[];
  ailmentSlug?: string;
}

export default function TopRemedies({ remedies, ailmentSlug }: TopRemediesProps) {
  const [sortBy, setSortBy] = useState("Overall Rating");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    setSortBy(option);
    setIsOpen(false);
  };

  // Close dropdown if click happens outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
       <div className="flex text-yellow-400 gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`}>
            <Image 
              src="/star.svg" 
              alt="Star"
              width={16}
              height={16}
            />
          </span>
        ))}
        {hasHalfStar && (
          <span key="half">
            <Image 
              src="/star-half-fill.svg" // Assuming you have a half-star icon
              alt="Half Star"
              width={16}
              height={16}
            />
          </span>
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <span key={`empty-${i}`}>
            <Image 
              src="/star-line.svg" 
              alt="Empty Star"
              width={16}
              height={16}
            />
          </span>
        ))}
      </div>
    );
  }


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
     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
  <div className="flex items-center gap-3">
    <img src="/top-remedies.svg" alt="" className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
    <h2 className="text-2xl sm:text-3xl lg:text-4xl  text-[#0B0C0A] leading-tight">
      Popular Remedies
    </h2>
  </div>
  
  {/* Sort Dropdown */}
  <div className="flex flex-row items-center gap-2 sm:ml-auto">
    <label
      htmlFor="sort-remedies"
      className="font-semibold text-[#2B2E28] text-xs sm:text-sm whitespace-nowrap sm:pl-3"
    >
      Sort by:
    </label>

    <div ref={dropdownRef} className="relative w-auto">
      {/* Button */}
      <button
        id="sort-remedies"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-1 min-w-[133px] sm:min-w-[148px] sm:pl-1  py-2 text-sm sm:text-base text-[#20231E]  focus:outline-none"
      >
        <span className="truncate">{sortBy}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-gray-700 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <ul className="absolute z-10 mt-1 top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {["Overall Rating", "Most Reviewed", "Alphabetical"].map((option) => (
            <li
              key={option}
              onClick={() => handleSelect(option)}
              className={`px-3 py-2 text-sm sm:text-base cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors ${
                sortBy === option ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>

      {/* Remedies List */}
      <div className="space-y-2.5 mb-[10px]">
        {sortedRemedies.map((remedy, index) => (
          <Link href={ailmentSlug ? `/${ailmentSlug}/${remedy.slug}` : `/remedies/${remedy.slug}`} key={remedy.slug}>
            <div className="bg-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200 mb-[10px]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* Icon */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F9F7F2] rounded-full flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                  {remedy.icon}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-2">
                    <div>
                      <h3 className="text-lg sm:text-xl text-[#0B0C0A] font-semibold text-montserrat break-words">{remedy.name}</h3>
                      <p className="text-sm sm:text-base font-medium text-[#2B2E28] break-words">{remedy.indication}</p>
                    </div>
                    <div className="hidden sm:block text-right text-3xl sm:text-4xl lg:text-5xl font-serif text-kingred text-[#7D5C4E]">
                      #{index + 1}
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    {renderStars(remedy.rating)}
                    <span className="text-xs sm:text-sm text-[#41463B]">
                      {typeof remedy.rating === 'number' ? remedy.rating.toFixed(1) : 'N/A'} ({remedy.reviewCount} reviews)
                    </span>
                  </div>
                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2 font-medium break-words">{remedy.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Load More */}
      <div className="flex justify-center mt-6 sm:mt-8 px-2">
        <Link href="/remedies" className="inline-block bg-[#6C7463] text-white px-6 sm:px-20 py-3 font-[600] rounded-full hover:bg-[#565D4F] transition-colors cursor-pointer duration-500 text-base sm:text-lg">
          View All Remedies
        </Link>
      </div>
    </div>
  );
}