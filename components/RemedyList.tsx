"use client";
import React, { useState, useMemo, ReactNode, useRef } from 'react';
import Link from 'next/link';
import { Remedy } from "@/types";
import Breadcrumb from "./Breadcrumb";
import Image from 'next/image';

interface RemedyListPageProps {
  remedies: Remedy[];
  currentPage: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;

export default function RemedyListPage({
  remedies: initialRemedies = [],
  currentPage: initialPage = 1,
  totalPages: initialTotalPages,
}: Partial<RemedyListPageProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState<string>(""); // "" | "az" | "most-reviewed"
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);


  const filteredRemedies = useMemo(() => {
    if (!searchQuery) return initialRemedies;
    return initialRemedies.filter((remedy) =>
      (remedy.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialRemedies, searchQuery]);

  // Apply sorting on the filtered results
  const sortedRemedies = useMemo(() => {
    const arr = [...filteredRemedies];
    if (sortBy === "az") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "most-reviewed") {
      arr.sort((a, b) => {
        const ra = Number(a.reviewCount ?? a.review_count ?? 0);
        const rb = Number(b.reviewCount ?? b.review_count ?? 0);
        return rb - ra;
      });
    }
    return arr;
  }, [filteredRemedies, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedRemedies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRemedies = sortedRemedies.slice(startIndex, endIndex);

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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "All Remedies", isActive: true }
        ]}
        className="border-b border-gray-200"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 lg:px-5 py-8">
        {/* Remedies Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Image
                className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px]"
                src="/top-remedies.svg"
                alt="Top Remedies Icon"
                width={60}
                height={60}
              />
              <h1 className="text-4xl font-serif text-gray-900">
                All Remedies
              </h1>
            </div>
            <p className="text-gray-600 mt-2">
              Browse through our comprehensive collection of homeopathic remedies.
            </p>
          </div>

          <div className='flex items-center justify-between'>
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6 text-gray-600">
                Found {filteredRemedies.length} remedy{filteredRemedies.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
                {filteredRemedies.length > ITEMS_PER_PAGE && (
                  <span className="ml-2">
                    (Showing {startIndex + 1}-{Math.min(endIndex, filteredRemedies.length)})
                  </span>
                )}
              </div>
            )}

            {!searchQuery && filteredRemedies.length > ITEMS_PER_PAGE && (
              <div className="mb-6 text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredRemedies.length)} of {filteredRemedies.length} remedies
              </div>
            )}

            {/* Sort control */}
            {/* Sort control */}
            <div className="mb-6 flex items-center gap-3 justify-end">
              <label className="text-base font-medium text-[#2B2E28]">Sort by:</label>

              <div ref={sortDropdownRef} className="relative">
                {/* Button */}
                <button
                  type="button"
                  onClick={() => setIsSortOpen(prev => !prev)}
                  className="flex items-center gap-1 text-[#2B2E28] text-base font-normal"
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

                {/* Dropdown */}
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

          </div>


          {/* Sort By */}
          {/* <div className="flex items-center justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-center relative" ref={dropdownRef}>
              <span className="sm:font-semibold font-regular text-[#2B2E28] text-base leading-[24px]  whitespace-nowrap text-montserrat">Sort by:</span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="appearance-none sm:pl-1 pr-5 py-2 text-base leading-[24px] min-w-[130px] text-[#20231E] font-medium focus:outline-none" >
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
                <ChevronDown className={`absolute right-0 sm:right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#20231E] pointer-events-none transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 top-full left-0  bg-white border border-gray-300 rounded-md shadow-lg">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setIsDropdownOpen(false); }}
                      className={`px-3 py-2 w-full text-sm text-start hover:bg-[#6c74631f] font-medium hover:text-[#6C7463] transition ${sortBy === opt.value ? "bg-[#6c74631f] text-[#6C7463] font-semibold" : "text-gray-700"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div> */}

          {/* Remedies Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 gap-3">
            {paginatedRemedies.length > 0 ? (
              paginatedRemedies.map((remedy) => {
                const avg = Number(remedy.rating ?? remedy.average_rating ?? 0);
                const reviews = Number(remedy.reviewCount ?? remedy.review_count ?? 0);

                return (
                  <Link href={`/remedies/${remedy.slug}`} key={remedy.slug}>
                    <div
                      className="bg-white rounded-xl sm:p-6 p-3 border border-gray-200 hover:shadow-lg  transition-all text-left h-full flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-5xl mb-3">{remedy.icon || '🌿'}</div>
                        <h4 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#2C5F4F] transition-colors">
                          {remedy.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{remedy.description}</p>
                      </div>
                      <div className="sm:text-sm text-xs text-gray-500 mt-3 flex sm:flex-nowrap flex-wrap  items-center gap-2">
                        <span className="flex items-center gap-1 text-[#E69E29]">
                          <Image src="/star.svg" alt="Star" width={16} height={16} />
                          <span>{avg.toFixed(1)}</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span>
                          {reviews} {" "}
                          {reviews === 1 ? "review" : "reviews"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No remedies found matching your search.</p>
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
          {totalPages > 1 && paginatedRemedies.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Previous
                </button>

                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${currentPage === page
                        ? 'bg-[#4B544A] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                </button>
              </div>

              <div className="text-center mt-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}