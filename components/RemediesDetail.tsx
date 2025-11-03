"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, StarHalf, StarOff, Search, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewFilterModal from "./ReviewFilterModal";
import AddReviewForm from "./AddReviewForm";

// ---------------------------
// Mock Data
// ---------------------------
const remedy = {
  name: "Belladonna",
  subtitle: "For throbbing, pulsating headaches",
  rating: 4.8,
  reviewsCount: 2314,
  quickStats: {
    overallRating: 4.8,
    totalReviews: 892,
    successRate: "87%",
    mostPopularPotency: "30C",
  },
  symptoms: [
    { title: "Sudden Onset", desc: "Headaches that come on quickly and intensely" },
    { title: "Throbbing Pain", desc: "Pulsating pain, beating sensation in the head" },
    { title: "Heat & Redness", desc: "Face feels hot and may appear flushed" },
    { title: "Light Sensitivity", desc: "Bright light worsens headache" },
  ],
  origin: {
    name: "Atropa Belladonna",
    alias: "Deadly Nightshade",
    description: `Belladonna has been used medicinally for centuries, despite its toxic nature in crude form. 
    The name “belladonna” means “beautiful lady” in Italian, referring to its historical use by women to dilate their pupils for cosmetic purposes.`,
    homeopathic: `In homeopathy, Belladonna was proven by Samuel Hahnemann himself in the early 1800s. When prepared homeopathically, it becomes completely safe and is one of the most frequently used remedies for acute conditions involving sudden onset, heat, and inflammation.`,
  },
  reviews: [
    {
      id: 1,
      name: "Emily R.",
      rating: 5,
      text: "I used to get tension headaches every week from work stress. After a few doses of Nux Vomica, the pain eased within an hour. I feel calmer and more balanced now!",
      tags: ["Pellet", "6C", "Once daily", "1–2 weeks"],
      timeAgo: "1 hour ago",
    },
    {
      id: 2,
      name: "Sophia L.",
      rating: 4.5,
      text: "My migraine attacks were intense and came with light sensitivity. Belladonna worked surprisingly fast! The throbbing pain subsided within a few hours.",
      tags: ["Pellet", "6C", "Once daily", "1–2 weeks"],
      timeAgo: "3 days ago",
    },
  ],
};

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
export default function RemediesDetailPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortBy, setSortBy] = useState("Most Recent");
   const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const sectionRefs = {
    Overview: useRef<HTMLElement>(null),
    Origin: useRef<HTMLElement>(null),
    Reviews: useRef<HTMLElement>(null),
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

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[#F5F1E8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900">
              Home
            </a>
            <span>/</span>
            <a href="#" className="hover:text-gray-900">
              Headache
            </a>
            <span>/</span>
            <span className="text-gray-900 ">{remedy.name}</span>
          </div>
        </div>
      </div>

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
                <div className="w-15 h-15 p-3 bg-green-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 mr-3">🌿</div>
              </div>
              <div className="w-full">
                <h1 className="text-[32px] lg:text-[40px] font-serif text-[#0B0C0A] mb-2 lg:mb-0">{remedy.name}</h1>
                <p className="text[#41463B] text-[16px] mb-4">{remedy.subtitle}</p>
                <div className="flex items-center gap-2 mb-6">
                  {renderStars(remedy.rating)}
                  <span className="text[#41463B] text-sm">
                    {remedy.rating} ({remedy.reviewsCount.toLocaleString()} reviews for headaches)
                  </span>
                </div>

                <h4 className="text-[20px] text-[#2B2E28] font-bold mb-5 text-montserrat">Key Symptoms for {remedy.name} Headaches:</h4>
                <div className="grid sm:grid-cols-2 gap-2 gap-y-8">
                  {remedy.symptoms.map((s, i) => (
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
                  <span className="font-semibold">{remedy.quickStats.overallRating}/5</span>
                </li>
                <li className="flex justify-between">
                  <span className="text[#2B2E28] font-medium">Total Reviews</span>
                  <span className="font-semibold">{remedy.quickStats.totalReviews}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text[#2B2E28] font-medium">Success Rate</span>
                  <span className="font-semibold text-[#175F3D]">{remedy.quickStats.successRate}</span>
                </li>
              </ul>
              <div className="mt-6">
                <p className="text-[16px] text-[#0B0C0A] mb-2 font-semibold">Common Potencies</p>
                <div className="flex justify-between flex-wrap font-medium text-[#2B2E28]">
                  <div className="">{remedy.quickStats.mostPopularPotency} <span className="text-xs text-[#2B2E28]"></span></div>
                </div>
              </div>
            </aside>
        </section>

        {/* Origin Section */}
        <section id="Origin" ref={sectionRefs.Origin} className="bg-white rounded-[8px] p-6 scroll-mt-20">
          <p className="text-[20px] text-[#0B0C0A] font-semibold  mb-4" >Origin</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-15 h-15 p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-3xl flex-shrink-0 mr-2">🌿</div>
              <div>
                <h6 className="text-[16px] text-[#0B0C0A] font-semibold text-montserrat mb-1">{remedy.origin.name}</h6>
                <p className="text-sm text-[#0B0C0A] font-medium">Also known as “{remedy.origin.alias}”</p>
              </div>
            </div>
            <p className="text-[#41463B] font-medium mb-4">{remedy.origin.description}</p>
            <p className="text-[#41463B] font-medium">{remedy.origin.homeopathic}</p>
        </section>

        {/* Reviews Section */}
    
 <section className="bg-white rounded-2xl shadow-sm p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left – Rating Summary */}
        <aside className="col-span-1">
          <div className="flex flex-col items-center text-center border border-gray-200 rounded-2xl p-6 bg-[#F9F7F2]">
            <span className="text-5xl font-serif text-gray-800 mb-2">⭐</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-1">
              {remedy.rating}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Based on {remedy.reviewsCount.toLocaleString()} reviews
            </p>

            {/* Rating Bars */}
            <div className="w-full space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-700">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#6C7463] rounded-full"
                      style={{
                        width:
                          star === 5
                            ? "80%"
                            : star === 4
                            ? "12%"
                            : star === 3
                            ? "5%"
                            : star === 2
                            ? "2%"
                            : "1%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

             <button 
                  onClick={() => setIsReviewFormOpen(true)}
                  className="bg-[#6C7463] hover:bg-[#5A6B5D] text-white px-5 py-2 rounded-full text-sm font-medium transition"
                >
                  Review Remedy
                </button>
          </div>
        </aside>

        {/* Right – Reviews List */}
        <div className="col-span-2">
          {/* Header: Search + Sort */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md mr-[5pc]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Search reviews..."
                className="w-full pl-11 pr-14 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#6B7C6E] hover:bg-[#5A6B5D] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="text-gray-600">Sort by:</span>
              <span className="font-medium text-gray-900">{sortBy}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {remedy.reviews.map((r) => (
              <div
                key={r.id}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  {/* User Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6E3DA] flex items-center justify-center text-sm font-semibold text-gray-700">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{r.name}</p>
                      <div className="flex items-center gap-1">
                        {renderStars(r.rating)}
                        <span className="ml-1 text-sm text-gray-600">
                          {r.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <p className="text-sm text-gray-500">{r.timeAgo}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {r.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#F5F1E8] px-2 py-1 rounded-full text-gray-700 border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  num === 1
                    ? "bg-[#6C7463] text-white"
                    : "bg-[#F5F1E8] text-gray-700 hover:bg-[#EAE6DD]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ReviewFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => console.log("Applying filters:", filters)}
        // You might want to calculate the actual number of reviews
        totalResults={remedy.reviews.length}
      />
    </section>


        {/* Related Remedies Section */}
<section
  id="Related Remedies"
  ref={sectionRefs["Related Remedies"]}
  className=" p-8 scroll-mt-20"
>
  <h3 className="text-2xl font-serif text-gray-800 mb-6">Related Remedies</h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Remedy Card */}
    {[
      {
        id: 1,
        name: "Bryonia Alba",
        image: "🟠",
        rating: 3.8,
        reviews: 2314,
        description: "Best for: Headaches that worsen with movement",
      },
      {
        id: 2,
        name: "Coffea Cruda",
        image: "☕",
        rating: 3.8,
        reviews: 2314,
        description:
          "Best for: Headaches from excitement, stress, or lack of sleep",
      },
      {
        id: 3,
        name: "Gelsemium Sempervirens",
        image: "🌻",
        rating: 3.8,
        reviews: 2314,
        description:
          "Best for: Headaches from anticipation, nervous tension, or flu",
      },
    ].map((item) => (
      <div
        key={item.id}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{item.image}</span>
          <h4 className="font-semibold text-gray-800 text-lg">
            {item.name}
          </h4>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm text-gray-700">
          {renderStars(item.rating)}
          <span className="ml-1">{item.rating.toFixed(1)}</span>
          <span className="text-gray-500">
            ({item.reviews.toLocaleString()} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {item.description}
        </p>
      </div>
    ))}
  </div>
</section>

        {/* <section id="Related Remedies" ref={sectionRefs['Related Remedies']} className="bg-white rounded-2xl shadow-sm p-8 text-gray-600 scroll-mt-20">
            <p>Related remedies will appear here.</p>
        </section> */}
      </main>
    {isReviewFormOpen && <AddReviewForm onClose={() => setIsReviewFormOpen(false)} />}
      {/* Footer */}
      <Footer />
    </div>
  );
}
