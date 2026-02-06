"use client";

import { useState, useEffect, useRef } from "react";
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
  const [sortBy, setSortBy] = useState<string>(""); // "" | "az" | "most-reviewed"
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

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

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayCount = isMobile ? 5 : 17;

  return (
    <section className="px-4 py-6 lg:py-10 bg-[#f5f3ed]">
      <div className="max-w-7xl px-0 lg:px-5 mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <img className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]" src="/ailments-icon.svg" alt="" />
            <h3 className="text-3xl sm:text-2xl md:text-3xl lg:text-[40px] leading-tight font-normal text-[#0B0C0A]">
              {searchQuery.trim() ? "Ailment Results" : "Popular Ailments"}
            </h3>
          </div>

          {/* Sort control (matches AilmentList styles) */}
          <div className="flex flex-wrap items-center sm:gap-3 gap-1 justify-end">
            <label className="text-sm font-medium text-[#2B2E28]">Sort by:</label>

            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((p) => !p)}
                className="flex items-center gap-1 text-[#20231E] text-sm font-normal cursor-pointer focus:outline-none"
              >
                <span>
                  {sortBy === "az"
                    ? "A - Z"
                    : sortBy === "za"
                      ? "Z - A"
                      : sortBy === "most-reviewed"
                        ? "Most Remedies"
                        : "Default"}
                </span>

                <svg
                  className={`h-4 w-4 transition-transform ${isSortOpen ? "rotate-180" : "rotate-0"}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </button>

              {isSortOpen && (
                <ul className="absolute right-0 mt-1 w-[140px] bg-white border border-gray-300 rounded-md shadow-lg z-20 overflow-hidden">
                  {[
                    { label: "Default", value: "" },
                    { label: "A - Z", value: "az" },
                    { label: "Z - A", value: "za" },
                    { label: "Most Reviewed", value: "most-reviewed" }
                  ].map(opt => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${sortBy === opt.value
                        ? "bg-[#6C7463] text-white font-medium"
                        : "text-gray-700 hover:bg-[#6c746333]"
                        }`}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 lg:grid-cols-4 gap-4 lg:gap-6">
          {(() => {
            const list = [...ailments];
            if (sortBy === 'az') {
              list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            } else if (sortBy === 'za') {
              list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            } else if (sortBy === 'most-reviewed') {
              list.sort((a, b) => (b.remedies_count ?? 0) - (a.remedies_count ?? 0));
            }
            return list.slice(0, displayCount).map((ailment) => (
              <AilmentCard key={ailment.id} ailment={ailment} />
            ));
          })()}
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