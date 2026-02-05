"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Remedy } from "@/types";

interface TopRatedRemediesServerProps {
  topRemedies: Remedy[];
  searchQuery?: string;
}

export default function TopRatedRemediesServer({
  topRemedies,
  searchQuery = ""
}: TopRatedRemediesServerProps) {
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

  const displayCount = isMobile ? 5 : topRemedies.length;

  // Just use the original remedy data - no need to refetch stats
  // The stats are already calculated and stored in the remedies table
  const remediesWithStats = topRemedies.slice(0, displayCount);

  return (
    <section className="px-4 py-6 lg:py-10 bg-[#f5f3ed]">
      <div className="max-w-7xl px-0 lg:px-5 mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Image
            className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]"
            src="/top-remedies.svg"
            alt="Top Remedies Icon"
            width={60}
            height={60}
          />
          <h3 className="text-3xl sm:text-2xl md:text-3xl lg:text-[40px] leading-tight font-normal text-[#0B0C0A]">
            {searchQuery.trim() ? "Remedy Results" : "Popular Remedies"}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
          {remediesWithStats.map((remedy, index) => (
            <Link
              key={remedy.id || index}
              href={`/remedies/${remedy.slug || remedy.id}`}
              className="bg-white rounded-xl p-4 transition-shadow hover:shadow-lg block transition-all duration-500"
            >
              <div className="md:flex items-start gap-4">
                <div className="w-15 h-15 p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-3xl flex-shrink-0 sm:mr-3 sm:mb-0 mb-3">{remedy.icon}</div>
                <div className="flex-1">
                  <p className="font-[600] lg:text-[20px] sm:text-[16px] text-[14px] mb-1 text-[#0B0C0A]">{remedy.name}</p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="flex text-yellow-400 gap-1">
                      {[...Array(Math.floor(remedy.average_rating))].map((_, i) => (
                        <span key={i}>
                          <Image
                            src="/star.svg"
                            alt="Star"
                            width={16}
                            height={16}
                          />
                        </span>
                      ))}
                      {[...Array(5 - Math.floor(remedy.average_rating))].map((_, i) => (
                        <span key={i}>
                          <Image
                            src="/star-line.svg"
                            alt="Star"
                            width={16}
                            height={16}
                          />
                        </span>
                      ))}
                    </div>
                    <span className="text-[#41463B] font-[500] text-sm sm:text-base break-words max-w-[120px] sm:max-w-none">
                      {remedy.average_rating.toFixed(1)} ({remedy.reviewCount} {remedy.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                  <p className="text-[#2B2E28] font-[500]">{remedy.description}</p>
                </div>
              </div>
            </Link>
          ))}
          {!searchQuery.trim() && (
            <Link href="/remedies" className="bg-[#4B544A] text-white rounded-xl py-14 px-6 flex items-center justify-center hover:bg-[#2B2E28] transition-colors cursor-pointer transition-all duration-500">
              <span className="font-[600] md:text-[20px] text-[18px] text-white text-center d-block">View All Remedies</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}