"use client";

import Link from "next/link";
import { Remedy } from "@/types";

interface TopRatedRemediesProps {
  topRemedies: Remedy[];
  searchQuery: string;
}

export default function TopRatedRemedies({ topRemedies, searchQuery }: TopRatedRemediesProps) {
  return (
    <section className="px-4 py-6 lg:py-10 bg-[#f5f3ed]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <img className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]" src="/top-remedies.svg" alt="" />
          <h3 className="text-[28px] lg:text-[40px]">
            {searchQuery.trim() ? "Remedy Results" : "Top Rated Remedies"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRemedies.map((remedy, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-15 h-15 bg-[#F9F7F2] rounded-full flex items-center justify-center text-2xl flex-shrink-0 p-2.5">
                  <img src="/Blossom.png" alt="" />
                </div>
                <div className="flex-1">
                  <p className="font-[600] text-[20px] mb-1">{remedy.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}><img src="/star.svg" alt="" /></span>
                      ))}
                    </div>
                    <span className="text-[#41463B] font-[500]">
                      {remedy.average_rating.toFixed(1)} ({remedy.review_count}{" "}
                      reviews)
                    </span>
                  </div>
                  <p className="text-[#2B2E28] font-[500]">{remedy.description}</p>
                </div>
              </div>
            </div>
          ))}
          {!searchQuery.trim() && (
            <Link href="/remedies" className="bg-[#4B544A] text-white rounded-xl h-[136px] lg:h-[auto] p-6 flex items-center justify-center hover:bg-[#2B2E28] transition-colors cursor-pointer transition-all duration-500">
              <span className="font-[600] text-[20px] text-white">View all Remedies</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}