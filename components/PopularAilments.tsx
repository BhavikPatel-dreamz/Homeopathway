"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ailment } from "@/types";

interface PopularAilmentsProps {
  ailments: Ailment[];
  searchQuery: string;
}

export default function PopularAilments({ ailments, searchQuery }: PopularAilmentsProps) {
  const router = useRouter();

  function nameToSlug(name: string) {
    return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-');
  }

  const handleSelectAilment = (ailment: Ailment) => {
    // Use the slug from the database, fallback to generated slug if not available
    const slug = ailment.slug || nameToSlug(ailment.name);
    router.push(`/ailments/${slug}`, { scroll: false });
  };

  return (
    <section className="px-4 py-6 lg:py-10 bg-[#f5f3ed]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <img className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]" src="/ailments-icon.svg" alt="" />
          <h3 className="text-[28px] lg:text-[40px]">
            {searchQuery.trim() ? "Ailment Results" : "Popular Ailments"}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 lg:grid-cols-4 gap-4 lg:gap-6">
          {ailments.slice(0, 17).map((ailment) => (
            <button key={ailment.id} onClick={() => handleSelectAilment(ailment)}>
              <div className="flex items-center bg-white rounded-xl pr-4 pl-4 pt-7 pb-7 transition-shadow cursor-pointer h-full">
                <div className="text-3xl mb-2 mr-5 w-[32px] h-[32px]">{ailment.icon}</div>
                <div>
                  <p className="text-[16px] font-[600] mb-1 text-[#0B0C0A]">{ailment.name}</p>
                  <p className="text-[#7D5C4E] text-[12px] font-[500] flex items-center">
                    <img className="mr-1" src="/remedies.svg" alt="" /> {ailment.remedies_count} remedies
                  </p>
                </div>
              </div>
            </button>
          ))}
          {!searchQuery.trim() && (
            <Link href="/ailments">
              <div className="bg-[#4B544A] text-white rounded-xl p-4 flex items-center justify-center hover:bg-[#2B2E28] transition-colors cursor-pointer h-full transition-all duration-500">
                <span className="font-[600] text-white text-[16px]">View all Ailments</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}