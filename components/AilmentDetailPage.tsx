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
      <div className="bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="#" className=" text-[#41463B] hover:text-[#0B0C0A] underline font-[16px]  transition-all duration-500">Back to home</a>
            <span>/</span>
            <span className="text-[#0B0C0A] font-[500]">Headache</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-10">
        {/* Ailment Header */}
        <div className="bg-white rounded-[8px]  pl-4 pr-4 pt-6 pb-6 lg:p-6 mb-6 lg:mb-10 flex-row lg:flex-col">
          <div className="flex justify-between items-start lg:items-center mb-6 flex-col lg:flex-row">
            <div className="text-7xl flex items-start lg:items-center flex-col lg:flex-row">
              <div className="text-[40px] md:text-[50px] lg:text-[60px] mr-4 mb-2 lg:mb-0">{ailment.icon}</div>              
              <h1 className="text-[32px] lg:text-[40px] mt-2 font-serif text-[#0B0C0A] mb-2 lg:mb-0">{ailment.name}</h1>
            </div>
            <div className="flex-1 ">
              <p className="text-[#7D5C4E] text-[12px] font-[500] flex items-center justify-end">
                <img className="mr-1" src="/remedies.svg" alt="" /> {ailment.remedies_count} remedies
              </p>            
            </div>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className=" text-[16px] font-[500] text-[#41463B]">{ailment.description}</p>
            <p className=" text-[16px] font-[500] text-[#41463B]">{ailment.personalizedApproach}</p>
          </div>
        </div>

        {/* Top Remedies Section */}
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 w-1/2">
              <img src="/top-remedies.svg" alt="" />
              <h2 className="text-[28px] lg:text-[40px]  text-[#0B0C0A]">Top Remedies</h2>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative w-1/2">
              <div className="flex items-center justify-end flex-col lg:flex-row">
                <div className="mr-1 font-[500]">Sort by:</div>
                <select className="block text-[#20231E] text-[16px] focus:outline-none">
                  <option value="">Select an option</option>
                  <option>Option One</option>
                  <option>Option Two</option>
                  <option>Option Three</option>
                </select>
              </div>
              
            </div>
          </div>

          {/* Remedies List */}
          <div className="space-y-4 flex flex-col">
            {remedies.map((remedy, index) => (
              <Link href={`/remedies/${remedy.id}`} key={remedy.id}>
                <div className="bg-white rounded-[8px] p-4 lg:p-6 transition-shadow cursor-pointer">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`w-15 h-15 p-3 ${remedy.color} rounded-full flex items-center justify-center text-3xl flex-shrink-0`}>
                      {remedy.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4 flex-col">
                        <div className="flex items-start w-full justify-between">
                          <div>
                            <h3 className="text-[20px] text-[#0B0C0A] font-semibold mb-1 text-montserrat">{remedy.name}</h3>
                            <p className="text-[16px] text-[#2B2E28] mb-1">{remedy.indication}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[40px] md:text-[40px] lg:text-[48px] text-kingred leading-none text-[#7D5C4E]">#{index + 1}</div>
                          </div>
                     
                        </div>
                    

                      {/* Rating */}
                      <div className="flex items-center gap-2 w-full">
                        {renderStars(remedy.rating)}
                        <span className="text-sm text-[#2B2E28]">
                          {remedy.rating} ({remedy.reviewCount.toLocaleString()} reviews for {remedy.ailment})
                        </span>
                      </div>
                      </div>

                      {/* Description */}
                      <p className="text-[16px] text-[#2B2E28] text-sm leading-relaxed max-w-[100%] lg:max-w-[60%]">{remedy.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <button className="bg-[#6C7463] text-white px-20 py-3 font-[600] rounded-full  hover:bg-[#565D4F] transition-colors  cursor-pointer transition-all duration-500">View all Remedies</button>
          </div>
        </div>
      </main>

      {/* Footer */}
            <Footer/>
    </div>
  );
}