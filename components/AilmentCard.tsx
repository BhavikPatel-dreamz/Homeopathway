import Link from "next/link";
import Image from "next/image";
import { Ailment } from "@/types";

interface AilmentCardProps {
  ailment: Ailment;
}

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-');
}

export default function AilmentCard({ ailment }: AilmentCardProps) {
  const slug = ailment.slug || nameToSlug(ailment.name);

  return (
    <Link href={`/${slug}`} className="block h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white rounded-xl pr-3 pl-3 pt-4 pb-4 sm:pr-4 sm:pl-4 sm:pt-7 sm:pb-7 transition-shadow hover:shadow-lg transition-all duration-500 cursor-pointer h-full">

        {/* ICON */}
        <div className="text-2xl sm:text-3xl mb-2 sm:mb-2 mr-0 sm:mr-[16px] w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] flex-shrink-0 flex items-center justify-center">
          {ailment.icon}
        </div>

        {/* TEXT CONTAINER — THIS FIXES OVERFLOW */}
        <div className="w-full min-w-0">   {/* 👈 IMPORTANT FIX */}

          <p className="
            text-[15px] sm:text-[16px] font-[600] mb-1 text-[#0B0C0A]
            whitespace-normal break-words
          ">
            {ailment.name}
          </p>

          <p className="text-[#7D5C4E] text-[11px] sm:text-[12px] font-[500] flex items-center">
            <Image className="mr-1" src="/remedies.svg" alt="remedies icon" width={14} height={14} />
            {ailment.remedies_count} remedies
          </p>
        </div>
      </div>
    </Link>
  );
}
