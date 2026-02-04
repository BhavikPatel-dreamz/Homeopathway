"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ailment } from "@/types";
import AilmentCard from "./AilmentCard";

interface PopularAilmentsServerProps {
  ailments: Ailment[];
  searchQuery?: string;
}

export default function PopularAilmentsServer({
  ailments,
  searchQuery = ""
}: PopularAilmentsServerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const displayCount = isMobile ? 5 : 17;

  return (
    <section className="px-4 py-6 lg:py-10 bg-[#f5f3ed]">
      <div className="max-w-7xl px-0 lg:px-5 mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <img className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]" src="/ailments-icon.svg" alt="" />
          <h3 className="text-3xl sm:text-2xl md:text-3xl lg:text-[40px] leading-tight font-normal text-[#0B0C0A]">
            {searchQuery.trim() ? "Ailment Results" : "Popular Ailments"}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 lg:grid-cols-4 gap-4 lg:gap-6">
          {ailments.slice(0, displayCount).map((ailment) => (
            <AilmentCard key={ailment.id} ailment={ailment} />
          ))}
          {!searchQuery.trim() && (
            <Link href="/ailments">
              <div className="bg-[#4B544A] text-white rounded-xl p-4 flex items-center justify-center hover:bg-[#2B2E28] transition-colors cursor-pointer h-full transition-all duration-500">
                <span className="font-[600] text-white text-[14px] md:text-[16px]">View All Ailments</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}