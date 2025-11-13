"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image"; // Import next/image

import Breadcrumb from "@/components/Breadcrumb";
import { breadcrumbPaths } from "@/lib/breadcrumbUtils";

import { Remedy } from "@/types";
import ReviewListPage from "./ReviewList";

// ---------------------------
// Type Definitions
// ---------------------------
interface Symptom {
  title: string;
  desc: string;
}

interface RemediesDetailPageProps {
  remedy: Remedy & {
    id:string,
    name:string,
    // Add other fields from your Supabase table here if they are not in the base Remedy type
    scientific_name?: string;
    common_name?: string;
    constitutional_type?: string;
    dosage_forms?: string[];
    safety_precautions?: string;
    slug: string;
  }
  relatedRemedies: Remedy[];
  review?: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: { [key: string]: number };
  };
  ailmentContext?: {
    id: string;
    name: string;
    slug: string;
  };
}

// ---------------------------
// Utility Functions
// ---------------------------
 const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      // <div className="flex items-center gap-0.5">
      //   {[...Array(5)].map((_, i) => (
      //     <span key={i} className={i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-gray-300'  }>
      //       {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '⯨' : '☆'}
      //     </span>
      //   ))}
      // </div>
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
              src="/star-half.svg" // Assuming you have a half-star icon
              alt="Half Star"
              width={16}
              height={16}
            />
          </span>
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <span key={`empty-${i}`}>
            <Image 
              src="/star-blank.svg" 
              alt="Empty Star"
              width={16}
              height={16}
            />
          </span>
        ))}
      </div>
    );
  }

// ---------------------------
// Main Component
// ---------------------------
export default function RemediesDetailPage({ remedy, relatedRemedies, ailmentContext ,review }: RemediesDetailPageProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  const sectionRefs = {
 Overview: useRef<HTMLDivElement>(null),
 Origin: useRef<HTMLDivElement>(null),
 Reviews: useRef<HTMLDivElement>(null),
    "Related Remedies": useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const handleTabClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const symptoms: Symptom[] = useMemo(() => {
    if (!remedy.key_symptoms) return [];
    // Assuming key_symptoms is an array of strings.
    // If they are in "Title: Description" format, you might need more parsing.
    return remedy.key_symptoms.map(symptom => {
      const parts = symptom.split(':');
      if (parts.length > 1) {
        return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
      }
      return { title: symptom, desc: '' };
    });
  }, [remedy.key_symptoms]);

  if (!remedy) {
    return <div>Loading remedy details...</div>; // Or a 404 component
  }

  const filteredRelatedRemedies = relatedRemedies
    .filter(r => r.slug !== remedy.slug)
    .slice(0, 3);


    console.log("Remedy Detail Review Data:", review?.average_rating);


  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={ailmentContext 
          ? [
              { label: "Home", href: "/" },
              // { label: "Ailments", href: "/ailments" },
              { label: ailmentContext.name, href: `/${ailmentContext.slug}` },
              { label: remedy.name, isActive: true }
            ]
          : breadcrumbPaths.remedyDetail(remedy.name, "All Remedies", "/remedies")
        }
      />

      {/* Tabs */}
      <div className="sticky top-[99px] sm:top-[100px] md:top-[120px] lg:top-[142px] z-10 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
         <div className="border-t border-[#B5B6B1] w-full flex gap-2 sm:gap-6 md:gap-9 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
             {["Overview", "Origin", "Reviews", "Related Remedies"].map((tab) => (
           <button
              key={tab}
                onClick={() => handleTabClick(tab)}
                className={`snap-start py-2 sm:py-3 md:pt-8 text-xs sm:text-sm md:text-base border-t-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                ? "border-[#0B0C0A] text-[#0B0C0A]"
                 : "border-transparent text-[#41463B] hover:text-[#0B0C0A] hover:border-[#0B0C0A] transition-all duration-500"
           }`}
        >
      {tab}
    </button>
  ))}
</div>
         </div>
      </div>

      {/* Main Content */}
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 md:space-y-10">
        {/* Overview Section */}
        <section
          id="Overview"
          ref={sectionRefs.Overview}
          className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 scroll-mt-[15rem]"
        >
          {/* Left */}
          <div className="lg:w-[71%] bg-white rounded-[8px] p-4 sm:p-6 flex items-start">
            <div className="flex items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 p-2 sm:p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 mr-2 sm:mr-3">
                {remedy.icon}
              </div>
            </div>
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] xl:text-[40px] font-serif text-[#0B0C0A] mb-2 lg:mb-0 break-words">
                {remedy.name}
              </h1>
              <p className="text-sm sm:text-base text-[#41463B] mb-3 sm:mb-4 font-medium">
                {remedy.description}
              </p>
              <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
                {renderStars(
                  review?.average_rating ? review?.average_rating : remedy.average_rating
                )}
                <span className="text-[#41463B] text-xs sm:text-sm">
                  {review?.average_rating.toFixed(1) || remedy.average_rating.toFixed(1)} (
                  {review?.total_reviews.toLocaleString() ||
                    remedy.review_count.toLocaleString()}{" "}
                  reviews)
                </span>
              </div>

              <h4 className="text-base sm:text-lg md:text-[20px] text-[#2B2E28] font-bold mb-3 sm:mb-5 text-montserrat">
                Key Symptoms for {remedy.name} Headaches:
              </h4>
              <div className="grid gap-3 sm:gap-4 md:gap-y-8 md:grid-cols-2">
              {symptoms.map((s, i) => {
               const cleanTitle = (s.title || "")
                 .replace(/^'+|'+$/g, "")
                 .replace(/^"+|"+$/g, "")
                 .trim();
             const cleanDesc = (s.desc || "")
                  .replace(/^'+|'+$/g, "")
                  .replace(/^"+|"+$/g, "")
                  .trim();
    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    return (
      <div key={i} className="flex gap-2 sm:gap-3 items-start">
        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#C3AF76] rounded-full flex-shrink-0 mt-1" />
        <div className="min-w-0">
          <p className="text-sm sm:text-base text-[#2B2E28] font-semibold break-words">
            {capitalize(cleanTitle)}
          </p>
          <p className="text-xs sm:text-sm text-[#2B2E28] font-medium">
            {capitalize(cleanDesc)}
          </p>
        </div>
      </div>
    );
  })}
</div>

            </div>
          </div>

          {/* Right - Quick Stats */}
          <aside className="bg-white lg:w-[29%] rounded-[8px] p-4 h-fit">
            <h3 className="text-sm sm:text-base text-[#0B0C0A] font-semibold mb-3 sm:mb-4 text-montserrat">
              Quick Stats
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
              <li className="flex justify-between">
                <span className="text-[#2B2E28] font-medium">Overall Rating</span>
                <span className="font-semibold">
                  {review?.average_rating.toFixed(1) || remedy.average_rating.toFixed(1)}/5
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#2B2E28] font-medium">Total Reviews</span>
                <span className="font-semibold">
                  {review?.total_reviews ? review?.total_reviews : remedy.review_count}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#2B2E28] font-medium">Success Rate</span>
                <span className="font-semibold text-[#175F3D]">N/A</span>
              </li>
            </ul>

            <div className="mt-4 sm:mt-6">
              <p className="text-sm sm:text-base text-[#0B0C0A] mb-2 font-semibold">
                Common Potencies
              </p>
              <div className="flex justify-between flex-wrap font-medium text-[#2B2E28] text-xs sm:text-sm">
                <div>
                  {(remedy.dosage_forms || [])
                    .map((item) => item.replace(/^'+|'+$/g, "").replace(/^"+|"+$/g, ""))
                    .join(", ")}
                  <span className="text-xs text-[#2B2E28]"></span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Origin Section */}
        <section
          id="Origin"
          ref={sectionRefs.Origin}
          className="bg-white rounded-[8px] p-4 sm:p-6 lg:scroll-mt-[23rem] sm:scroll-mt-[19rem]"
        >
          <p className="text-lg sm:text-xl md:text-[20px] text-[#0B0C0A] font-semibold mb-4">
            Origin
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 p-2 sm:p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              {remedy.icon}
            </div>
            <div className="min-w-0">
              <h6 className="text-sm sm:text-base text-[#0B0C0A] font-semibold text-montserrat mb-1 break-words">
                {remedy.scientific_name || remedy.name}
              </h6>
              <p className="text-xs sm:text-sm text-[#0B0C0A] font-medium">
                Also known as {remedy.common_name}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#41463B] font-medium mb-3 sm:mb-4">
            {remedy.description}
          </p>
          <p className="text-sm sm:text-base text-[#41463B] font-medium">
            {remedy.safety_precautions}
          </p>
        </section>

        {/* Reviews Section */}
        <div ref={sectionRefs.Reviews}>
          <ReviewListPage
            remedy={remedy}
            ailmentContext={
              ailmentContext
                ? {
                    id: ailmentContext.id,
                    name: ailmentContext.name,
                    slug: ailmentContext.slug,
                  }
                : undefined
            }
          />
        </div>

        {/* Related Remedies Section */}
        <section
          id="Related Remedies"
          ref={sectionRefs["Related Remedies"]}
          className="scroll-mt-20"
        >
          <h3 className="text-2xl sm:text-3xl font-serif text-gray-800 mb-4 sm:mb-6">
            Related Remedies
          </h3>

          {filteredRelatedRemedies && filteredRelatedRemedies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-7">
              {filteredRelatedRemedies.map((item) => (
                <Link href={`/remedies/${item.slug}`} key={item.id}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-4 sm:p-5 flex flex-col gap-3 h-full cursor-pointer">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl">{item.icon || "💊"}</span>
                      <h4 className="font-semibold text-gray-800 text-base sm:text-lg break-words">
                        {item.name}
                      </h4>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-700 flex-wrap">
                      {renderStars(item.average_rating || 0)}
                      <span className="ml-1">{(item.average_rating || 0).toFixed(1)}</span>
                      <span className="text-gray-500">
                        ({(item.review_count || 0).toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm sm:text-base">No related remedies found.</p>
            </div>
          )}
        </section>
      </main>
             <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
