"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Star, StarHalf, StarOff, Search, ChevronDown } from "lucide-react";

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
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />);
    else if (i === fullStars && hasHalfStar)
      stars.push(<StarHalf key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />);
    else stars.push(<StarOff key={i} className="w-5 h-5 text-gray-300" />);
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

// ---------------------------
// Main Component
// ---------------------------
export default function RemediesDetailPage({ remedy, relatedRemedies, ailmentContext }: RemediesDetailPageProps) {
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


  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={ailmentContext 
          ? [
              { label: "Home", href: "/" },
              { label: "Ailments", href: "/ailments" },
              { label: ailmentContext.name, href: `/ailments/${ailmentContext.slug}` },
              { label: remedy.name, isActive: true }
            ]
          : breadcrumbPaths.remedyDetail(remedy.name, "All Remedies", "/remedies")
        }
      />

      {/* Tabs */}
      <div className="sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flextext-sm mt-3 font-medium">
          <div className="border-t border-[#B5B6B1] w-full flex gap-9 ">

          
          {["Overview", "Origin", "Reviews", "Related Remedies"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`pt-8 border-t-2 transition-all cursor-pointer ${
                activeTab === tab ? "border-[#0B0C0A] text-[#0B0C0A]" : "border-transparent text-[#41463B] hover:text-[#0B0C0A] hover:border-[#0B0C0A]  transition-all duration-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Overview Section */}
        <section id="Overview" ref={sectionRefs.Overview} className="flex gap-6 scroll-mt-20">
            {/* Left */}
            <div className="lg:w-[71%] bg-white rounded-[8px]  p-6 flex items-start">
              <div className="flex items-center">
                <div className="w-15 h-15 p-3 bg-green-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 mr-3">{remedy.icon}</div>
              </div>
              <div className="w-full">
                <h1 className="text-[32px] lg:text-[40px] font-serif text-[#0B0C0A] mb-2 lg:mb-0">{remedy.name}</h1>
                <p className="text[#41463B] text-[16px] mb-4">{remedy.description}</p>
                <div className="flex items-center gap-2 mb-6">
                  {renderStars(remedy.average_rating)}
                  <span className="text[#41463B] text-sm">
                    {remedy.average_rating.toFixed(1)} ({remedy.review_count.toLocaleString()} reviews)
                  </span>
                </div>

                <h4 className="text-[20px] text-[#2B2E28] font-bold mb-5 text-montserrat">Key Symptoms for {remedy.name} Headaches:</h4>
                <div className="grid sm:grid-cols-2 gap-2 gap-y-8">
                  {symptoms.map((s, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-3 h-3 mt-1.5 bg-[#C3AF76] rounded-full"></div>
                      <div>
                        <p className="tex-[16px] text-[#2B2E28] font-semibold">{s.title}</p>
                        <p className="text-sm text-[#2B2E28] font-medium">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
         
            </div>

            {/* Right - Quick Stats */}
            <aside className="bg-white lg:w-[29%] white rounded-[8px]  p-4 h-fit">
              <h3 className="text-[16px] text[#0B0C0A] font-semibold mb-4 text-montserrat">Quick Stats</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span className="text[#2B2E28] font-medium">Overall Rating</span>
                  <span className="font-semibold">{remedy.average_rating.toFixed(1)}/5</span>
                </li>
                <li className="flex justify-between">
                  <span className="text[#2B2E28] font-medium">Total Reviews</span>
                  <span className="font-semibold">{remedy.review_count}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text[#2B2E28] font-medium">Success Rate</span>
                  <span className="font-semibold text-[#175F3D]">N/A</span>
                </li>
              </ul>
              <div className="mt-6">
                <p className="text-[16px] text-[#0B0C0A] mb-2 font-semibold">Common Potencies</p>
                <div className="flex justify-between flex-wrap font-medium text-[#2B2E28]">
                  <div className="">{(remedy.dosage_forms || []).join(', ')} <span className="text-xs text-[#2B2E28]"></span></div>
                </div>
              </div>
            </aside>
        </section>

        {/* Origin Section */}
        <section id="Origin" ref={sectionRefs.Origin} className="bg-white rounded-[8px] p-6 scroll-mt-20">
          <p className="text-[20px] text-[#0B0C0A] font-semibold  mb-4" >Origin</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-15 h-15 p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-3xl flex-shrink-0 mr-2">{remedy.icon}</div>
              <div>
                <h6 className="text-[16px] text-[#0B0C0A] font-semibold text-montserrat mb-1">{remedy.scientific_name || remedy.name}</h6>
                <p className="text-sm text-[#0B0C0A] font-medium">Also known as “{remedy.common_name}”</p>
              </div>
            </div>
            <p className="text-[#41463B] font-medium mb-4">{remedy.description}</p>
            <p className="text-[#41463B] font-medium">{remedy.safety_precautions}</p>
        </section>

        {/* Reviews Section */}
        <div ref={sectionRefs.Reviews}>
          <ReviewListPage 
            remedy={remedy} 
            ailmentContext={ailmentContext ? {
              id: ailmentContext.id,
              name: ailmentContext.name,
              slug: ailmentContext.slug
            } : undefined}
          />
        </div>
        {/* Related Remedies Section */}
       <section
       id="Related Remedies"
       ref={sectionRefs["Related Remedies"]}
      className=" p-8 scroll-mt-20"
        >
  <h3 className="text-2xl font-serif text-gray-800 mb-6">Related Remedies</h3>

  {filteredRelatedRemedies && filteredRelatedRemedies.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRelatedRemedies.map((item) => (
        <Link href={`/remedies/${item.slug}`} key={item.id}>
          <div
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3 h-full cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{item.icon || '💊'}</span>
              <h4 className="font-semibold text-gray-800 text-lg">
                {item.name}
              </h4>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-sm text-gray-700">
              {renderStars(item.average_rating || 0)}
              <span className="ml-1">{(item.average_rating || 0).toFixed(1)}</span>
              <span className="text-gray-500">
                ({(item.review_count || 0).toLocaleString()} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  ) : (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <p className="text-gray-500">No related remedies found.</p>
    </div>
  )}
        </section>

      </main>
 

    </div>
  );
}
