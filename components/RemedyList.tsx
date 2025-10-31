"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Footer from "./Footer";
import Header from "./Header";

interface Remedy {
  id: string;
  name: string;
  description: string;
  average_rating: number;
  review_count: number;
}

interface RemedyListPageProps {
  remedies: Remedy[];
  currentPage: number;
  totalPages: number;
}

// Mock data for demonstration - 30 remedies
const mockRemedies: Remedy[] = [
  { id: "1", name: "Arnica Montana", description: "For bruises, sprains, and muscle soreness.", average_rating: 4.8, review_count: 320 },
  { id: "2", name: "Belladonna", description: "For sudden high fever, redness, and throbbing pain.", average_rating: 4.7, review_count: 280 },
  { id: "3", name: "Nux Vomica", description: "For indigestion, nausea, and hangovers.", average_rating: 4.6, review_count: 410 },
  { id: "4", name: "Pulsatilla", description: "For colds with thick, yellow-green mucus.", average_rating: 4.5, review_count: 190 },
  { id: "5", name: "Ignatia Amara", description: "For grief, anxiety, and emotional stress.", average_rating: 4.9, review_count: 350 },
  { id: "6", name: "Chamomilla", description: "For teething pain and irritability in children.", average_rating: 4.8, review_count: 250 },
  { id: "7", name: "Gelsemium", description: "For flu with weakness, dizziness, and drowsiness.", average_rating: 4.6, review_count: 180 },
  { id: "8", name: "Rhus Tox", description: "For joint pain that is worse on initial movement.", average_rating: 4.7, review_count: 220 },
  { id: "9", name: "Sulphur", description: "For skin rashes that are itchy and burn.", average_rating: 4.4, review_count: 300 },
  { id: "10", name: "Lycopodium", description: "For digestive issues with bloating and gas.", average_rating: 4.5, review_count: 260 },
  { id: "11", name: "Aconitum Napellus", description: "For sudden onset of fear, anxiety, or fever.", average_rating: 4.7, review_count: 150 },
  { id: "12", name: "Apis Mellifica", description: "For insect bites, hives, and swelling.", average_rating: 4.8, review_count: 210 },
  { id: "13", name: "Bryonia Alba", description: "For dry cough and pain worse with motion.", average_rating: 4.6, review_count: 170 },
  { id: "14", name: "Calcarea Carbonica", description: "For fatigue, anxiety, and slow metabolism.", average_rating: 4.5, review_count: 230 },
  { id: "15", name: "Cantharis", description: "For urinary tract infections with burning pain.", average_rating: 4.7, review_count: 140 },
  { id: "16", name: "Carbo Vegetabilis", description: "For bloating, gas, and faintness.", average_rating: 4.4, review_count: 190 },
  { id: "17", name: "Causticum", description: "For chronic conditions, paralysis, and coughs.", average_rating: 4.6, review_count: 160 },
  { id: "18", name: "Cinchona Officinalis", description: "For weakness from fluid loss, fever, and gas.", average_rating: 4.5, review_count: 130 },
  { id: "19", name: "Drosera", description: "For deep, barking coughs, especially at night.", average_rating: 4.7, review_count: 180 },
  { id: "20", name: "Ferrum Phosphoricum", description: "For the first stage of fever and inflammation.", average_rating: 4.6, review_count: 200 },
  { id: "21", name: "Hepar Sulphuris Calcareum", description: "For painful, infected sores and coughs.", average_rating: 4.7, review_count: 170 },
  { id: "22", name: "Hypericum Perforatum", description: "For nerve injuries and sharp, shooting pains.", average_rating: 4.8, review_count: 240 },
  { id: "23", name: "Ipecacuanha", description: "For persistent nausea and vomiting.", average_rating: 4.6, review_count: 150 },
  { id: "24", name: "Kali Bichromicum", description: "For sinus congestion with thick, stringy mucus.", average_rating: 4.5, review_count: 190 },
  { id: "25", name: "Lachesis Mutus", description: "For menopause symptoms, sore throats, and jealousy.", average_rating: 4.7, review_count: 160 },
  { id: "26", name: "Ledum Palustre", description: "For puncture wounds and insect bites.", average_rating: 4.8, review_count: 210 },
  { id: "27", name: "Mercurius Vivus", description: "For sore throats, earaches, and mouth ulcers.", average_rating: 4.5, review_count: 180 },
  { id: "28", name: "Natrum Muriaticum", description: "For grief, headaches, and cold sores.", average_rating: 4.6, review_count: 250 },
  { id: "29", name: "Phosphorus", description: "For anxiety, respiratory issues, and bleeding.", average_rating: 4.7, review_count: 220 },
  { id: "30", name: "Sepia", description: "For hormonal imbalances and exhaustion.", average_rating: 4.8, review_count: 270 },
];

const ITEMS_PER_PAGE = 12;

export default function RemedyListPage({
  remedies = mockRemedies,
  currentPage: initialPage = 1,
  totalPages: initialTotalPages,
}: Partial<RemedyListPageProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);

  const filteredRemedies = useMemo(() => {
    if (!searchQuery) return remedies;
    return remedies.filter((remedy) =>
      remedy.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [remedies, searchQuery]);

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

  const handleRemedyClick = (remedyId: string) => {
    console.log(`Navigating to remedy: ${remedyId}`);
    // In your Next.js app, this would be handled by Link, e.g., router.push(`/remedies/${remedyId}`)
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
            <span className="text-gray-900 font-medium">All Remedies</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Remedies Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">💊</span>
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
              paginatedRemedies.map((remedy) => (
                <button
                  key={remedy.id}
                  onClick={() => handleRemedyClick(remedy.id)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#2C5F4F] transition-all text-left h-full flex flex-col justify-between group"
                >
                  <div>
                    <div className="text-5xl mb-3">💊</div>
                    <h4 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#2C5F4F] transition-colors">
                      {remedy.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{remedy.description}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <span>⭐</span>
                      <span>{remedy.average_rating.toFixed(1)}</span>
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>{remedy.review_count} reviews</span>
                  </p>
                </button>
              ))
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

      {/* Footer */}
      <Footer />
    </div>
  );
}