"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Footer from "./Footer";
import Header from "./Header";

interface Ailment {
  id: string;
  name: string;
  icon: string;
  remedies_count: number;
}

interface AilmentListPageProps {
  ailments: Ailment[];
  currentPage: number;
  totalPages: number;
}

// Mock data for demonstration - 30 ailments
const mockAilments: Ailment[] = [
  { id: "1", name: "Headache", icon: "🤕", remedies_count: 12 },
  { id: "2", name: "Common Cold", icon: "🤧", remedies_count: 15 },
  { id: "3", name: "Allergies", icon: "🤒", remedies_count: 8 },
  { id: "4", name: "Anxiety", icon: "😰", remedies_count: 10 },
  { id: "5", name: "Insomnia", icon: "😴", remedies_count: 14 },
  { id: "6", name: "Digestive Issues", icon: "🤢", remedies_count: 18 },
  { id: "7", name: "Back Pain", icon: "🧘", remedies_count: 9 },
  { id: "8", name: "Arthritis", icon: "🦴", remedies_count: 11 },
  { id: "9", name: "Fatigue", icon: "😫", remedies_count: 7 },
  { id: "10", name: "Skin Conditions", icon: "🧴", remedies_count: 13 },
  { id: "11", name: "Respiratory Issues", icon: "🫁", remedies_count: 16 },
  { id: "12", name: "Stress", icon: "😓", remedies_count: 10 },
  { id: "13", name: "Depression", icon: "😔", remedies_count: 9 },
  { id: "14", name: "Migraine", icon: "🤯", remedies_count: 14 },
  { id: "15", name: "Asthma", icon: "😮‍💨", remedies_count: 11 },
  { id: "16", name: "Eczema", icon: "🩹", remedies_count: 8 },
  { id: "17", name: "Joint Pain", icon: "💪", remedies_count: 12 },
  { id: "18", name: "Sinusitis", icon: "👃", remedies_count: 10 },
  { id: "19", name: "Constipation", icon: "🚽", remedies_count: 7 },
  { id: "20", name: "Diarrhea", icon: "💩", remedies_count: 6 },
  { id: "21", name: "Fever", icon: "🌡️", remedies_count: 13 },
  { id: "22", name: "Cough", icon: "🤧", remedies_count: 15 },
  { id: "23", name: "Acne", icon: "😣", remedies_count: 9 },
  { id: "24", name: "Hair Loss", icon: "💇", remedies_count: 8 },
  { id: "25", name: "Menstrual Cramps", icon: "💊", remedies_count: 11 },
  { id: "26", name: "Toothache", icon: "🦷", remedies_count: 7 },
  { id: "27", name: "Eye Strain", icon: "👁️", remedies_count: 6 },
  { id: "28", name: "Earache", icon: "👂", remedies_count: 8 },
  { id: "29", name: "Nausea", icon: "🤮", remedies_count: 10 },
  { id: "30", name: "Vertigo", icon: "😵", remedies_count: 9 },
];

const ITEMS_PER_PAGE = 12;

export default function AilmentListPage({
  ailments = mockAilments,
  currentPage: initialPage = 1,
  totalPages: initialTotalPages,
}: Partial<AilmentListPageProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);

  const filteredAilments = useMemo(() => {
    if (!searchQuery) return ailments;
    return ailments.filter((ailment) =>
      ailment.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ailments, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAilments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAilments = filteredAilments.slice(startIndex, endIndex);

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

  const handleAilmentClick = (ailmentId: string) => {
    console.log(`Navigating to ailment: ${ailmentId}`);
    // In your Next.js app, this would be handled by Link
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
    <Header />
      {/* Breadcrumb */}
      <div className="bg-[#F5F1E8] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Back to home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">All Ailments</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Ailments Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">💊</span>
            <div className="flex-1">
              <h1 className="text-4xl font-serif text-gray-900">All Ailments</h1>
              <p className="text-gray-600 mt-2">
                Browse through our comprehensive collection of ailments and find the right homeopathic remedies for you.
              </p>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6 text-gray-600">
              Found {filteredAilments.length} ailment{filteredAilments.length !== 1 ? 's' : ''} matching "{searchQuery}"
              {filteredAilments.length > ITEMS_PER_PAGE && (
                <span className="ml-2">
                  (Showing {startIndex + 1}-{Math.min(endIndex, filteredAilments.length)})
                </span>
              )}
            </div>
          )}

          {!searchQuery && filteredAilments.length > ITEMS_PER_PAGE && (
            <div className="mb-6 text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAilments.length)} of {filteredAilments.length} ailments
            </div>
          )}

          {/* Ailments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedAilments.length > 0 ? (
              paginatedAilments.map((ailment) => (
                <button
                  key={ailment.id}
                  onClick={() => handleAilmentClick(ailment.id)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#2C5F4F] transition-all text-left h-full flex flex-col justify-between group"
                >
                  <div>
                    <div className="text-5xl mb-3">{ailment.icon}</div>
                    <h4 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#2C5F4F] transition-colors">
                      {ailment.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                    <span>🔬</span>
                    <span>{ailment.remedies_count} remedies</span>
                  </p>
                </button>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}