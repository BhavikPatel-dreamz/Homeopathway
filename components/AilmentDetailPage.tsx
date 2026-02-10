"use client" 
import Footer from "@/components/Footer";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";
import TopRemedies from "./TopRemedies";
import Image from "next/image";
import { useState, useEffect } from "react";
import AddReviewForm from "./AddReviewForm";

interface Remedy {
  id: string;
  name: string;
  indication: string;
  rating: number;
  reviewCount: number;
  description: string;
  key_symptoms?: string[];
  slug:string;
  icon:string;
}

interface Ailment {
  id: string;
  name: string;
  slug: string;
  icon: string;
  remedies_count: number;
  description: string;
  personalized_approach: string;
}

interface AilmentDetailPageProps {
  ailment: Ailment;
  remedies: Remedy[];
}

export default function AilmentDetailPage({ ailment, remedies }: AilmentDetailPageProps) {
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  useEffect(() => {
    // Ensure the page starts at the top when navigating to an ailment
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    // { label: "Ailments", href: "/ailments" },
    { label: ailment.name, isActive: true }
  ];



  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-5 pb-10">
        {/* Ailment Header */}
        <div className="bg-white rounded-lg  pl-4 pr-4 pt-6 pb-6 lg:p-6 mb-4 lg:mb-6 flex-row lg:flex-col">
          <div className="flex justify-between items-start lg:items-center mb-6 flex-col lg:flex-row">
            <div className="text-7xl flex items-start lg:items-center flex-col lg:flex-row">
              <div className="text-[40px] md:text-[50px] lg:text-[60px] mr-4 mb-2 lg:mb-0">{ailment.icon}</div>
              <h1 className="text-[32px] lg:text-[40px] mt-2 font-normal font-serif text-[#0B0C0A] mb-2 lg:mb-0">{ailment.name}</h1>
            </div>
            <div className="flex-1 ">
              <p className="text-[#7D5C4E] text-[16px] font-medium flex items-center justify-end">
                <Image className="mr-1" src="/remedies.svg" alt="remedies icon" width={16} height={16} /> { (remedies && remedies.length) ? remedies.length : ailment.remedies_count } remedies
              </p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className=" text-[16px] font-medium text-[#41463B]">{ailment.description}</p>
            <p className=" text-[16px] font-medium text-[#41463B]">{ailment.personalized_approach}</p>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex justify-end mb-4 lg:mb-10">
          <button
            onClick={() => setShowAddReviewForm(true)}
            className="text-montserrat px-5 py-[9px] bg-[#6C7463] text-white border border-[#6C7463] rounded-full font-semibold text-base leading-[24px] cursor-pointer transition-all duration-500 hover:bg-[#5A6B5D]"
          >
            Review a Remedy
          </button>
        </div>


        {/* Top Remedies Section */}
        <TopRemedies remedies={remedies} ailmentSlug={ailment.slug} />
      </main>
      {showAddReviewForm && (
        <AddReviewForm
          onClose={() => setShowAddReviewForm(false)}
          remedyId={remedies?.[0]?.id || ""}
          remedyName={remedies?.[0]?.name || ""}
          condition={ailment.name}
          ailmentId={ailment.id}
        />
      )}

    </div>
  );
}