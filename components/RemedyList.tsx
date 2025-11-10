"use client";
import React, { useState, useMemo, ReactNode } from 'react';
import Link from 'next/link';
import { Remedy } from "@/types";
import Breadcrumb from "./Breadcrumb";
import Image from 'next/image';

interface RemedyListPageProps {
  remedies: Remedy[];
  currentPage: number;
  totalPages: number;
}



const ITEMS_PER_PAGE = 12;

export default function RemedyListPage({
  remedies: initialRemedies = [],
  currentPage: initialPage = 1,
  totalPages: initialTotalPages,
}: Partial<RemedyListPageProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);

  const filteredRemedies = useMemo(() => {
    if (!searchQuery) return initialRemedies;
    return initialRemedies.filter((remedy) =>
       (remedy.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialRemedies, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRemedies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRemedies = filteredRemedies.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: "Back to home", href: "/" },
          { label: "All Remedies", isActive: true }
        ]} 
        className="border-b border-gray-200"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Remedies Section */}
       <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-7">
           <Image 
                       className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]" 
                       src="/top-remedies.svg" 
                       alt="Top Remedies Icon"
                       width={60}
                       height={60}
                     />
            <div className="flex-1">
              <h1 className="text-4xl font-serif text-gray-900">All Remedies</h1> 
              <p className="text-gray-600 mt-2">
                Browse through our comprehensive collection of homeopathic remedies.
              </p>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6 text-gray-600">
              Found {filteredRemedies.length} remedy{filteredRemedies.length !== 1 ? 's' : ''} matching "{searchQuery}"
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

          {/* Remedies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedRemedies.length > 0 ? (
              paginatedRemedies.map((remedy) => {
                // Log the remedy object to inspect its properties
                return (
                <Link href={`/remedies/${remedy.slug}`} key={remedy.slug}>
                  <div
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#2C5F4F] transition-all text-left h-full flex flex-col justify-between group cursor-pointer"
                  >
                  <div>
                    <div className="text-5xl mb-3">{remedy.icon || '🌿'}</div>
                    <h4 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#2C5F4F] transition-colors">
                      {remedy.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{remedy.description}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <span>⭐</span>
                      <span>{(remedy.rating ?? remedy.average_rating)?.toFixed(1)}</span>
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>{remedy.reviewCount ?? remedy.review_count} reviews</span>
                  </p>
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
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        currentPage === page
                          ? 'bg-[#2C5F4F] text-white'
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