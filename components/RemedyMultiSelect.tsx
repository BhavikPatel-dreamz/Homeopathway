"use client";

import { useEffect, useState, useRef } from "react";
import type { RemedyOption } from "@/types";
import { Search } from "lucide-react";

interface Props {
  primaryRemedyId: string;
  primaryRemedyName: string;
  selected: RemedyOption[];
  onChange: (items: RemedyOption[]) => void;
}

export default function RemedyMultiSelect({
  primaryRemedyId,
  primaryRemedyName,
  selected,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [remedies, setRemedies] = useState<RemedyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------------- Fetch remedies ---------------- */
  useEffect(() => {
    fetch("/api/remedies")
      .then((res) => res.json())
      .then((data) => setRemedies(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- Filter (only when typing) ---------------- */
  const filtered =
    query.trim().length === 0
      ? []
      : remedies.filter((r) => {
          if (!r.id || !r.name) return false;
          if (r.id === primaryRemedyId) return false;
          return r.name.toLowerCase().includes(query.toLowerCase());
        });

  /* ---------------- Select remedy ---------------- */
  const selectRemedy = (remedy: RemedyOption) => {
    if (selected.some((s) => s.id === remedy.id)) return;
    onChange([...selected, remedy]);
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  /* ---------------- Keyboard handling ---------------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectRemedy(filtered[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* PRIMARY REMEDY */}
      {/* <p className="font-montserrat font-medium text-[16px] leading-[24px] text-[#41463B]">
        Your Primary Remedy:{" "}
        <span className="font-montserrat font-medium text-[16px] leading-[24px] text-[#41463B]">
          {primaryRemedyName}
        </span>
      </p> */}

      {/* SEARCH INPUT (WITH ICON) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A96]" />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search remedies..."
          className="
            w-full
            h-[44px]
            rounded-[8px]
            border-2 border-[#F8F6F2]
            pl-10 pr-4
            text-[14px]
            text-[#41463B]
            font-medium
            placeholder:text-[#9A9A96]
            focus:outline-none
            focus:border-[#6C7463]
          "
        />
      </div>

      {/* DROPDOWN (ONLY WHILE SEARCHING) */}
      {query && (
      <div
        className="
          border border-[#E6E6E3]
          rounded-[10px]
          bg-white
          shadow-[0px_0px_12px_-4px_rgba(26,26,26,0.16)]
          overflow-hidden
        "
      >
        {/* Scrollable area */}
        <div
          className="
            max-h-[72px]
            overflow-y-auto
            pl-1 pr-4 py-1
            scrollbar
          "
        >
          {loading && (
            <p className="text-sm text-center py-3 text-[#8E8E8A]">
              Loading remedies…
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-sm text-center py-3 text-[#8E8E8A]">
              No remedies found
            </p>
          )}

          {filtered.map((r, index) => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectRemedy(r)}
              className={`
                w-full
                flex items-center gap-3
                px-2 py-1
                rounded-[8px]
                text-left
                transition
                ${
                  index === activeIndex
                    ? "bg-[#F3F4F0] border border-[#6C7463]"
                    : "hover:bg-[#F7F7F5]"
                }
              `}
            >
              <span className="w-[24px] h-[24px] bg-[#F9F7F2] rounded-[45px] flex items-center justify-center text-[16px]">
                {r.icon || "🌿"}
              </span>

              <span className="flex-1 font-medium text-[16px] leading-[24px] text-[#0B0C0A]">
                {r.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    )}


      {/* SELECTED CHIPS (MATCH IMAGE) */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((r) => (
            <span
              key={r.id}
              className="
                flex items-center gap-1
                px-3 py-1.5
                rounded-[6px]
                bg-[#F1F2F0]
                font-medium
                text-[14px]
                leading-[22px]
                text-[#41463B] "
            >
              {r.name}
              <button
                type="button"
                onClick={() =>
                  onChange(selected.filter((s) => s.id !== r.id))
                }
                className="text-[#8E8E8A] hover:text-[#0B0C0A] text-xl"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
