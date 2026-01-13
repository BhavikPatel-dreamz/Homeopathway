"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import Breadcrumb from "@/components/Breadcrumb";
import { breadcrumbPaths } from "@/lib/breadcrumbUtils";

import { Remedy } from "@/types";
import ReviewListPage from "./ReviewList";

// ---------------------------
// Type Definitions
// ---------------------------
interface RemediesDetailPageProps {
  remedy: Remedy & {
    id: string;
    name: string;
    scientific_name?: string;
    common_name?: string;
    constitutional_type?: string;
    safety_precautions?: string;
    slug: string;
  };
  relatedRemedies: Remedy[];
  review?: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: { [key: string]: number };
  };
  ailmentContext?: {
    id: string;
    name: string;
    slug: string;
  };
}

// ---------------------------
// Utility Functions
// ---------------------------
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex text-yellow-400 gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`}>
          <Image src="/star.svg" alt="Star" width={16} height={16} />
        </span>
      ))}
      {hasHalfStar && (
        <span key="half">
          <Image src="/star-half-fill.svg" alt="Half Star" width={16} height={16} />
        </span>
      )}
      {[...Array(5 - Math.ceil(rating))].map((_, i) => (
        <span key={`empty-${i}`}>
          <Image src="/star-line.svg" alt="Empty Star" width={16} height={16} />
        </span>
      ))}
    </div>
  );
};

// ---------------------------
// Main Component
// ---------------------------
export default function RemediesDetailPage({
  remedy,
  relatedRemedies,
  ailmentContext,
  review,
}: RemediesDetailPageProps) {
  // activeTab is initialized to "Overview", fixing the initial tab issue.
  const [activeTab, setActiveTab] = useState("Overview");

  const overviewRef = useRef<HTMLDivElement>(null!);
  const originRef = useRef<HTMLDivElement>(null!);
  const reviewsRef = useRef<HTMLDivElement>(null!);
  const relatedRef = useRef<HTMLDivElement>(null!);

  // Parse symptoms from remedy data
  const symptoms = React.useMemo(() => {
    if (!remedy.key_symptoms) return [];
    return remedy.key_symptoms.map((symptom) => {
      const parts = symptom.split(":");
      if (parts.length > 1) {
        return {
          title: parts[0].trim().replace(/^'+|'+$/g, "").replace(/^"+|"+$/g, ""),
          desc: parts.slice(1).join(":").trim().replace(/^'+|'+$/g, "").replace(/^"+|"+$/g, ""),
        };
      }
      return { title: symptom.trim(), desc: "" };
    });
  }, [remedy.key_symptoms]);

  const filteredRelatedRemedies = relatedRemedies
    .filter((r) => r.slug !== remedy.slug)
    .slice(0, 3);

  // Helper to get the tabs sticky element bottom (pixels from viewport top)
  const getTabsBottom = () => {
    const tabsEl = document.getElementById("tabs-sticky");
    if (!tabsEl) {
      // fallback if not mounted yet
      return 120;
    }
    // bottom relative to viewport top
    return Math.round(tabsEl.getBoundingClientRect().bottom);
  };

  // click handler: scroll target so the section top appears just below the sticky tabs
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);

    type SectionRef = React.RefObject<HTMLDivElement | null>;
    let targetRef: SectionRef | null = null;

    if (tabName === "Overview") targetRef = overviewRef;
    if (tabName === "Origin") targetRef = originRef;
    if (tabName === "Reviews") targetRef = reviewsRef;
    if (tabName === "Related Remedies") targetRef = relatedRef;

    if (targetRef?.current) {
      const tabsBottom = getTabsBottom(); // px from viewport top
      const rect = targetRef.current.getBoundingClientRect();
      // current top of section relative to viewport; subtract tabsBottom to position it below tabs
      const desiredScrollY = window.pageYOffset + rect.top - tabsBottom + 8; // small gap
      window.scrollTo({ top: desiredScrollY, behavior: "smooth" });
    }
  };

  // Scroll listener: pick the section whose top is closest to tabs bottom
  useEffect(() => {
    let ticking = false;

    const sectionList = [
      { ref: overviewRef, tab: "Overview" },
      { ref: originRef, tab: "Origin" },
      { ref: reviewsRef, tab: "Reviews" },
      { ref: relatedRef, tab: "Related Remedies" },
    ];

    const detectActiveTab = () => {
      const tabsBottom = getTabsBottom();
      let closestTab = "Overview";
      let minDistance = Infinity;

      sectionList.forEach((s) => {
        const el = s.ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - tabsBottom);

        // ⭐ UNCOMMENTED: This logic must run to change the active tab on scroll
        if (distance < minDistance) {
          minDistance = distance;
          closestTab = s.tab;
        }
      });

      setActiveTab(closestTab);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        detectActiveTab();
        ticking = false;
      });
    };

    // ⭐ NEW FIX FOR INITIAL SCROLL POSITION (Browser Scroll Restoration)
    // Force scroll to top (0, 0) immediately after mount
    if (typeof window !== 'undefined' && window.pageYOffset !== 0) {
      window.scrollTo(0, 0);
    }
    // ⭐ END NEW FIX

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // Common potencies extracted from reviews
  const [commonPotencies, setCommonPotencies] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadPotencies() {
      try {
        const { getReviews } = await import('@/lib/review');
        // fetch many reviews for frequency analysis
        const { data: reviews } = await getReviews({ remedyId: remedy.id, limit: 10000 });
        if (!reviews || reviews.length === 0) {
          if (mounted) setCommonPotencies([]);
          return;
        }

        const freq: Record<string, number> = {};

        const normalize = (raw?: string | null) => {
          if (!raw) return '';
          const s = raw.toString().trim().toUpperCase();

          // Prefer explicit potency token like '12C', '30C', '200C', '6X', 'LM1', 'CH30'
          const m = s.match(/(LM\d*|CH\d*|\d+\s*[A-Z]{1,3})/);
          if (m && m[0]) return m[0].replace(/\s+/g, '');

          // Fallback: remove whitespace and non-alphanumeric
          return s.replace(/\s+/g, '').replace(/[^0-9A-Z]/g, '');
        };

        for (const r of reviews) {
          const p1raw = (r.potency || '') as string;
          const p2raw = (r.potency_2 || '') as string;
          const p1 = normalize(p1raw);
          const p2 = normalize(p2raw);
          if (p1) freq[p1] = (freq[p1] || 0) + 1;
          if (p2) freq[p2] = (freq[p2] || 0) + 1;
        }

        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([potency]) => potency)
          .filter(Boolean)
          .slice(0, 3);

        if (mounted) setCommonPotencies(sorted);
      } catch (err) {
        console.error('Failed to load potencies', err);
      }
    }

    loadPotencies();
    return () => { mounted = false };
  }, [remedy.id]);

  if (!remedy) {
    return <div>Loading remedy details...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      {/* Breadcrumb */}
      <Breadcrumb
        items={
          ailmentContext
            ? [
              { label: "Home", href: "/" },
              { label: ailmentContext.name, href: `/${ailmentContext.slug}` },
              { label: remedy.name, isActive: true },
            ]
            : breadcrumbPaths.remedyDetail(remedy.name, "All Remedies", "/remedies")
        }
      />

      {/* Sticky Tabs */}
      <div
        id="tabs-sticky"
        className="sticky top-[99px] sm:top-[100px] md:top-[120px] lg:top-[142px] z-10 bg-[#F5F1E8]"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6">
          <div className="border-t border-[#B5B6B1] w-full flex gap-1 sm:gap-1 lg:gap-9 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {["Overview", "Origin", "Reviews", "Related Remedies"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`snap-start py-2 sm:py-3 md:pt-8 px-1 sm:px-2 text-[12px] sm:text-sm md:text-sm lg:text-base border-t-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === tab
                  ? "border-[#0B0C0A] text-[#0B0C0A] font-medium"
                  : "border-transparent text-[#41463B] hover:text-[#0B0C0A] hover:border-[#0B0C0A] transition-all duration-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 md:space-y-10">
        {/* Overview Section */}
        <section
          ref={overviewRef}
          className="relative flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8"
        >
          {/* Left Content */}
          <div className="flex flex-col lg:w-[71%] bg-white rounded-lg ">
            <div className="p-4 sm:p-6 flex items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 p-2 sm:p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 mr-2 sm:mr-3">
                  {remedy.icon}
                </div>
              </div>
              <div className="w-full">
                <h1 className="text-2xl sm:text-2xl lg:text-[32px] xl:text-[40px] font-serif text-[#0B0C0A] mb-2 lg:mb-0 wrap-break-word font-normal">
                  {remedy.name}
                </h1>
                <p className="text-[16px] leading-6 sm:text-base text-[#41463B] mb-3 sm:mb-4 font-nomal md:font-medium">
                  {remedy.description}
                </p>
                <div className="text-[14px] leading-3.5  flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
                  {renderStars(remedy.average_rating)}
                  <span className="text-[#41463B] text-xs sm:text-sm">
                    {remedy.average_rating.toFixed(1)} ({remedy.review_count} {remedy.review_count === 1 ? "review" : "reviews"})
                  </span>
                </div>

                <h4 className="text-base sm:text-lg md:text-[20px] text-[#2B2E28] font-bold mb-3 sm:mb-5 text-montserrat">
                  Key Symptoms for {remedy.name} Headaches:
                </h4>
                <div className="text-black" ref={originRef}></div>
                <div className="grid gap-3 sm:gap-4 md:gap-y-8 md:grid-cols-2">
                  {symptoms.map((s, i) => (
                    <div key={i} className="flex gap-2 sm:gap-3 items-start">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#C3AF76] rounded-full shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-md sm:text-base text-[#2B2E28] font-semibold wrap-break-word">
                          {capitalize(s.title)}
                        </p>
                        {s.desc && (
                          <p className="text-xs sm:text-sm text-[#2B2E28] font-medium">
                            {capitalize(s.desc)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar - Quick Stats */}
          <aside className="bg-white lg:w-[29%] rounded-lg p-4 h-fit">
            <h3 className="text-md sm:text-base text-[#0B0C0A] font-semibold mb-3 sm:mb-4 text-montserrat">
              Quick Stats
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm  text-gray-700">
              <li className="flex justify-between">
                <span className="text-[#2B2E28] text-sm font-medium">Overall Rating</span>
                <span className="font-semibold text-sm">
                  {(review?.average_rating || remedy.average_rating).toFixed(1)}/5
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#2B2E28] text-sm font-medium">Total Reviews</span>
                <span className="font-semibold text-sm">
                  {review?.total_reviews || remedy.review_count}
                </span>
              </li>
              <li className="pt-2">
                <span className="text-[#0B0C0A] text-md sm:text-base font-semibold">Common Potencies</span>
                <div className="mt-2 grid grid-cols-3 gap-6 text-sm">
                  {(() => {
                    if (!commonPotencies || commonPotencies.length === 0) {
                      return <div className="col-span-3 text-sm text-gray-500">—</div>;
                    }

                    // Prepare three slots so we can align items: left, center, right
                    const slots: (string | null)[] = [null, null, null];
                    if (commonPotencies.length === 1) {
                      slots[1] = commonPotencies[0];
                    } else if (commonPotencies.length === 2) {
                      slots[0] = commonPotencies[0];
                      slots[1] = commonPotencies[1];
                    } else {
                      slots[0] = commonPotencies[0] || null;
                      slots[1] = commonPotencies[1] || null;
                      slots[2] = commonPotencies[2] || null;
                    }

                    return slots.map((s, idx) => (
                      <div
                        key={idx}
                        className={`text-[#2B2E28] font-medium text-md sm:text-base ${idx === 0 ? 'text-left' : idx === 1 ? 'text-center' : 'text-right'}`}
                      >
                        {s || ''}
                      </div>
                    ));
                  })()}
                </div>
              </li>
            </ul>
          </aside>

        </section>

        {/* Origin Section */}

        <section className={`bg-white rounded-lg p-4 sm:p-6  ${activeTab == "Reviews" ? "mb-10" : ""}`}>

          <p className="text-lg sm:text-xl md:text-[20px] text-[#0B0C0A] font-semibold mb-4">
            Origin
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 p-2 sm:p-3 bg-[#F9F7F2] rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              {remedy.icon}
            </div>
            <div className="min-w-0">
              <h6 className="text-sm sm:text-base text-[#0B0C0A] font-semibold text-montserrat mb-1 break-words">
                {remedy.scientific_name || remedy.name}
              </h6>
              <p className="text-xs sm:text-sm text-[#0B0C0A] font-medium">
                Also known as {remedy.common_name}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-[#41463B] font-medium mb-3 sm:mb-4">
            {remedy.description}
          </p>
          <p className="text-sm sm:text-base text-[#41463B] font-medium">
            {remedy.safety_precautions}
          </p>
        </section>

        {/* Reviews Section */}
        <div ref={reviewsRef} className={`bg-white rounded-lg p-4 sm:py-6 ${activeTab == "Related Remedies" ? "mb-15 md:mb-0" : ""}`}>
          <ReviewListPage
            remedy={remedy}
            ailmentContext={
              ailmentContext
                ? {
                  id: ailmentContext.id,
                  name: ailmentContext.name,
                  slug: ailmentContext.slug,
                }
                : undefined
            }
          />
        </div>

        {/* Related Remedies Section */}
        <section ref={relatedRef} className="sm:mb-0 mb-6">
          <h3 className="text-4xl sm:text-4xl lg:text-[32px] xl:text-[40px] font-serif text-[#0B0C0A] mb-4 mt-2 md:mt-10 sm:mb-6 wrap-break-word font-normal">
            Related Remedies
          </h3>

          {filteredRelatedRemedies && filteredRelatedRemedies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelatedRemedies.map((item) => (
                <Link href={`/remedies/${item.slug}`} key={item.id}>
                  <div className="bg-white rounded-[8px] hover:shadow-md transition-shadow pt-4 pr-2 pb-4 pl-4 flex items-start gap-4 h-full cursor-pointer">

                    {/* Icon */}
                    <div className="w-15 h-15 bg-[#F9F7F2] rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                      {item.icon || "💊"}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1 min-w-0">

                      {/* Title */}
                      <h4 className="font-semibold text-[20px] leading-[28px] text-[#0B0C0A] truncate font-family-montserrat">
                        {item.name}
                      </h4>


                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1 text-sm text-gray-700">
                        {renderStars(item.average_rating || 0)}
                        <span className="ml-1 font-medium">
                          {(item.average_rating || 0).toFixed(1)}
                        </span>
                        <span className="font-montserrat font-medium text-[14px] leading-[22px] text-[#41463B]">
                          ({item.review_count}{" "}
                          {item.review_count === 1 ? "review" : "reviews"})
                        </span>
                      </div>

                      {/* Description */}
                      <p className="font-montserrat font-medium text-[12px] leading-[20px] text-[#2B2E28] line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm sm:text-base">
                No related remedies found.
              </p>
            </div>
          )}

        </section>
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}