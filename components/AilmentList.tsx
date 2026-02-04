"use client";
import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Ailment } from "@/types";
import Breadcrumb from "./Breadcrumb";
import Image from 'next/image';

// interface Ailment {
//   id: string;
//   name: string;
//   icon: string;
//   remedies_count: number;
//   slug: string;
// }

interface AilmentListPageProps {
  ailments: Ailment[];
  currentPage: number;
  totalPages: number;
}

// Mock data for demonstration - 30 ailments
const mockAilments: Ailment[] = [
  { id: "1", name: "Headache", icon: "🤕", remedies_count: 12, slug: "headache" },
  { id: "2", name: "Common Cold", icon: "🤧", remedies_count: 15, slug: "common-cold" },
  { id: "3", name: "Allergies", icon: "🤒", remedies_count: 8, slug: "allergies" },
  { id: "4", name: "Anxiety", icon: "😰", remedies_count: 10, slug: "anxiety" },
  { id: "5", name: "Insomnia", icon: "😴", remedies_count: 14, slug: "insomnia" },
  { id: "6", name: "Digestive Issues", icon: "🤢", remedies_count: 18, slug: "digestive-issues" },
  { id: "7", name: "Back Pain", icon: "🧘", remedies_count: 9, slug: "back-pain" },
  { id: "8", name: "Arthritis", icon: "🦴", remedies_count: 11, slug: "arthritis" },
  { id: "9", name: "Fatigue", icon: "😫", remedies_count: 7, slug: "fatigue" },
  { id: "10", name: "Skin Conditions", icon: "🧴", remedies_count: 13, slug: "skin-conditions" },
  { id: "11", name: "Respiratory Issues", icon: "🫁", remedies_count: 16, slug: "respiratory-issues" },
  { id: "12", name: "Stress", icon: "😓", remedies_count: 10, slug: "stress" },
  { id: "13", name: "Depression", icon: "😔", remedies_count: 9, slug: "depression" },
  { id: "14", name: "Migraine", icon: "🤯", remedies_count: 14, slug: "migraine" },
  { id: "15", name: "Asthma", icon: "😮‍💨", remedies_count: 11, slug: "asthma" },
  { id: "16", name: "Eczema", icon: "🩹", remedies_count: 8, slug: "eczema" },
  { id: "17", name: "Joint Pain", icon: "💪", remedies_count: 12, slug: "joint-pain" },
  { id: "18", name: "Sinusitis", icon: "👃", remedies_count: 10, slug: "sinusitis" },
  { id: "19", name: "Constipation", icon: "🚽", remedies_count: 7, slug: "constipation" },
  { id: "20", name: "Diarrhea", icon: "💩", remedies_count: 6, slug: "diarrhea" },
  { id: "21", name: "Fever", icon: "🌡️", remedies_count: 13, slug: "fever" },
  { id: "22", name: "Cough", icon: "🤧", remedies_count: 15, slug: "cough" },
  { id: "23", name: "Acne", icon: "😣", remedies_count: 9, slug: "acne" },
  { id: "24", name: "Hair Loss", icon: "💇", remedies_count: 8, slug: "hair-loss" },
  { id: "25", name: "Menstrual Cramps", icon: "💊", remedies_count: 11, slug: "menstrual-cramps" },
  { id: "26", name: "Toothache", icon: "🦷", remedies_count: 7, slug: "toothache" },
  { id: "27", name: "Eye Strain", icon: "👁️", remedies_count: 6, slug: "eye-strain" },
  { id: "28", name: "Earache", icon: "👂", remedies_count: 8, slug: "earache" },
  { id: "29", name: "Nausea", icon: "🤮", remedies_count: 10, slug: "nausea" },
  { id: "30", name: "Vertigo", icon: "😵", remedies_count: 9, slug: "vertigo" },
];

const ITEMS_PER_PAGE = 12;

export default function AilmentListPage({
  ailments = mockAilments,
  currentPage: initialPage = 1,
  totalPages: initialTotalPages,
}: Partial<AilmentListPageProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<string>(""); // "" | "az" | "most-reviewed"
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);


  const filteredAilments = useMemo(() => {
    if (!searchQuery) return ailments;
    return ailments.filter((ailment) =>
      ailment.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ailments, searchQuery]);

  // Apply sorting to filtered ailments
  const sortedAilments = useMemo(() => {
    const arr = [...filteredAilments];
    if (sortBy === "az") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "most-reviewed") {
      arr.sort((a, b) => (b.remedies_count ?? 0) - (a.remedies_count ?? 0));
    }
    return arr;
  }, [filteredAilments, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedAilments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAilments = sortedAilments.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset to page 1 when sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and nearby pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };



  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "All Ailments", isActive: true }
        ]}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-5 py-8">
        {/* Ailments Section */}
        <div className="bg-white rounded-2xl sm:p-8 p-4 shadow-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px]" alt="" src="/ailments-icon.svg" />
              <h1 className="text-3xl lg:text-4xl font-normal text-[#0B0C0A] leading-tight">All Ailments</h1>
            </div>
            <p className="text-gray-600 mt-2">
              Browse through our comprehensive collection of ailments and find the right homeopathic remedies for you.
            </p>
          </div>

          {/* Sort control */}
          <div className="mb-6 flex items-center gap-3 justify-end">
            <label className="sm:text-base text-sm font-medium text-[#2B2E28]">Sort by:</label>

            <div ref={sortDropdownRef} className="relative">
              {/* Button */}
              <button
                type="button"
                onClick={() => setIsSortOpen(prev => !prev)}
                className="flex items-center gap-1 text-[#2B2E28] sm:text-base text-sm font-normal cursor-pointer focus:outline-none"
              >
                <span>
                  {sortBy === "az"
                    ? "A - Z"
                    : sortBy === "most-reviewed"
                      ? "Most Reviewed"
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

              {/* Dropdown Menu */}
              {isSortOpen && (
                <ul className="absolute right-0 mt-1 w-[160px] bg-white border border-gray-300 rounded-md shadow-lg z-20 overflow-hidden">
                  {[
                    { label: "Default", value: "" },
                    { label: "A - Z", value: "az" },
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


          {/* Ailments Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 gap-3">
            {paginatedAilments.length > 0 ? (
              paginatedAilments.map((ailment) => (
                <Link href={`/${ailment.slug}`} key={ailment.slug}>
                  <div className="bg-white rounded-xl sm:p-6 p-3 border border-gray-200 hover:shadow-lg  transition-all text-left h-full flex flex-col justify-between group cursor-pointer">
                    <div>
                      <div className="md:text-5xl text-3xl mb-3">{ailment.icon}</div>
                      <p className=" font- text-[15px] sm:text-[16px] font-semibold text-[#0B0C0A] whitespace-normal break-words  mb-2 group-hover:text-[#2C5F4F] transition-colors">
                        {ailment.name}
                      </p>
                    </div>
                    {/* <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                      <span>🔬</span>
                      <span>{ailment.remedies_count} remedies</span>
                    </p> */}
                    <p className="text-[#7D5C4E] text-[12px] font-[500] flex items-center">
                      <Image className="mr-1" src="/remedies.svg" alt="remedies icon" width={16} height={16} /> {ailment.remedies_count} remedies
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No ailments found matching your search.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-[#2C5F4F] hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && paginatedAilments.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="md:w-[40px] w-[30px] md:h-[40px] h-[30px] cursor-pointer flex items-center justify-center rounded-full bg-[#F5F3ED] hover:bg-[#ECE9E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.828 6.364L7.778 11.314L6.364 12.728L0 6.364L6.364 0L7.778 1.414L2.828 6.364Z" fill="#0B0C0A" />
                  </svg>
                </button>

                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`md:w-[40px] w-[30px] md:h-[40px] h-[30px] cursor-pointer flex items-center justify-center rounded-full transition-all transition-duration-300 font-medium ${currentPage === page
                        ? 'bg-[#6C7463] text-white'
                        : 'bg-[#F5F3ED] text-[#41463B] hover:bg-[#6C7463] hover:text-white '
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-500">
                      {page}
                    </span>
                  )
                ))}

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="md:w-[40px] w-[30px] md:h-[40px] h-[30px] cursor-pointer flex items-center justify-center p-0 rounded-full bg-[#F5F3ED] hover:bg-[#ECE9E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.95 6.364L0 1.414L1.414 0L7.778 6.364L1.414 12.728L0 11.314L4.95 6.364Z" fill="#0B0C0A" />
                  </svg>
                </button>
              </div>

              {/* <div className="text-center mt-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div> */}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
    </div>
  );
}