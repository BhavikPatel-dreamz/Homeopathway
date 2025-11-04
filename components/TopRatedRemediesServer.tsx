import Link from "next/link";
import Image from "next/image";
import { Remedy } from "@/types";

interface TopRatedRemediesServerProps {
  topRemedies: Remedy[];
  searchQuery?: string;
}

export default function TopRatedRemediesServer({ 
  topRemedies, 
  searchQuery = "" 
}: TopRatedRemediesServerProps) {
  return (
    <section className="px-4 py-6 lg:py-10 bg-[#f5f3ed]">
      <div className="max-w-7xl px-0 lg:px-5 mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Image 
            className="w-[40px] h-[40px] lg:w-[60px] lg:h-[60px]" 
            src="/top-remedies.svg" 
            alt="Top Remedies Icon"
            width={60}
            height={60}
          />
          <h3 className="text-[28px] lg:text-[40px] text-[#0B0C0A]">
            {searchQuery.trim() ? "Remedy Results" : "Top Rated Remedies"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRemedies.map((remedy, index) => (
            <Link
              key={remedy.id || index}
              href={`/remedies/${remedy.slug || remedy.id}`}
              className="bg-white rounded-xl p-4 transition-shadow hover:shadow-lg block transition-all duration-500" 
            >
              <div className="flex items-start gap-4">
                <div className="w-15 h-15 bg-[#F9F7F2] rounded-full flex items-center justify-center text-2xl flex-shrink-0 p-2.5">
                  <Image 
                    src="/Blossom.png" 
                    alt="Remedy Icon"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-[600] text-[20px] mb-1 text-[#0B0C0A]">{remedy.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(remedy.review_count)].map((_, i) => (
                        <span key={i}>
                          <Image 
                            src="/star.svg" 
                            alt="Star"
                            width={16}
                            height={16}
                          />
                        </span>
                      ))}
                       {[...Array(5-remedy.review_count)].map((_, i) => (
                        <span key={i}>
                          <Image 
                            src="/star-blank.svg" 
                            alt="Star"
                            width={16}
                            height={16}
                          />
                        </span>
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
            </Link>
          ))}
          {!searchQuery.trim() && (
            <Link href="/remedies" className="bg-[#4B544A] text-white rounded-xl py-14 px-6 flex items-center justify-center hover:bg-[#2B2E28] transition-colors cursor-pointer transition-all duration-500">
              <span className="font-[600] text-[20px] text-white">View all Remedies</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}