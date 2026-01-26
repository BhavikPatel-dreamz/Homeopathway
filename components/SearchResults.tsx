"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PopularAilmentsServer from "./PopularAilmentsServer";
import TopRatedRemediesServer from "./TopRatedRemediesServer";
import RequestAilmentRemedyModal from "./RequestAilmentRemedyModal";
import { Ailment, Remedy } from "@/types";

interface SearchResultsProps {
  ailments: Ailment[];
  remedies: Remedy[];
  searchQuery: string;
}

export default function SearchResults({ 
  ailments, 
  remedies, 
  searchQuery 
}: SearchResultsProps) {
  const router = useRouter();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const hasResults = ailments.length > 0 || remedies.length > 0;

  return (
    <div className="bg-[#f5f3ed]">
      {/* Search Header */}
      <div className="px-4 py-8 bg-[#2C3E3E] text-white">
        <div className="max-w-7xl px-0 lg:px-5 mx-auto">  
        <button 
            onClick={() => router.back()}
            className="flex items-center text-sm text-white hover:text-gray-200 mb-4"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
            Back
          </button>
        <span className="text-2xl lg:text-4xl font-bold mb-2">Search Results: {searchQuery ? ` ${searchQuery}` : ""}</span>
       
          {searchQuery && (
            <p className="text-lg">
              Showing results for &quot;{searchQuery}&quot;
            </p>
          )}
          {hasResults && (
            <p className="text-sm mt-2 opacity-80">
              Found {ailments.length} ailments and {remedies.length} remedies
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {hasResults ? (
        <>
          {ailments.length > 0 && (
            <PopularAilmentsServer 
              ailments={ailments}
              searchQuery={searchQuery}
            />
          )}
          {remedies.length > 0 && (
            <TopRatedRemediesServer 
              topRemedies={remedies}
              searchQuery={searchQuery}
            />
          )}
          
          {/* Request Section */}
          <div className="px-4 py-12 bg-[#f5f3ed]">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-[#7D5C4E] mb-3 font-medium">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-8 py-2.5 bg-[#5D7B6F] hover:bg-[#4a5f56] text-white rounded-lg font-medium transition-colors inline-block"
              >
                Request a new ailment or remedy
              </button>
            </div>
          </div>
        </>
      ) : searchQuery ? (
        <div className="px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-[#0B0C0A] mb-4">
              No results found
            </h2>
            <p className="text-[#7D5C4E] mb-8">
              We couldn&apos;t find any ailments or remedies matching "{searchQuery}". 
              Try searching with different keywords.
            </p>
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-[#0B0C0A] mb-3">Search suggestions</h3>
              <ul className="text-sm text-[#7D5C4E] space-y-1 text-left mb-4">
                <li>• Check your spelling</li>
                <li>• Try more general terms</li>
                <li>• Use common ailment names like &quot;headache&quot; or &quot;anxiety&quot;</li>
                <li>• Search for remedy names like &quot;arnica&quot; or &quot;belladonna&quot;</li>
              </ul>
              <p className="text-sm text-[#7D5C4E] mb-4 font-medium">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 px-6 py-2.5 bg-[#5D7B6F] hover:bg-[#4a5f56] text-white rounded-lg font-medium transition-colors inline-block"
              >
                Request a new ailment or remedy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-[#0B0C0A] mb-4">
              No results found.
            </h2>
            <p className="text-[#7D5C4E]">
               Try searching with different keywords.
            </p>
          </div>
        </div>
      )}

      {/* Request Modal */}
      <RequestAilmentRemedyModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        type="both"
      />
    </div>
  );
}