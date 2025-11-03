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
  // Use the slug from the database, fallback to generated slug if not available
  const slug = ailment.slug || nameToSlug(ailment.name);

  return (
    <Link href={`/ailments/${slug}`} className="block h-full">
      <div className="flex items-center bg-white rounded-xl pr-4 pl-4 pt-7 pb-7 transition-shadow hover:shadow-lg cursor-pointer h-full">
        <div className="text-3xl mb-2 mr-5 w-[32px] h-[32px]">{ailment.icon}</div>
        <div>
          <p className="text-[16px] font-[600] mb-1 text-[#0B0C0A]">{ailment.name}</p>
          <p className="text-[#7D5C4E] text-[12px] font-[500] flex items-center">
            <Image className="mr-1" src="/remedies.svg" alt="remedies icon" width={16} height={16} /> {ailment.remedies_count} remedies
          </p>
        </div>
      </div>
    </Link>
  );
}