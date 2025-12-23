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
      <p className="text-[14px] text-[#4B544A]">
        Your Primary Remedy:{" "}
        <span className="font-medium text-[#0B0C0A]">
          {primaryRemedyName}
        </span>
      </p>

      {/* SEARCH INPUT (WITH ICON) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A96]" />

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
            rounded-[10px]
            border border-[#E6E6E3]
            pl-10 pr-4
            text-[14px]
            text-[#0B0C0A]
            placeholder:text-[#9A9A96]
            focus:outline-none
            focus:border-[#6C7463]
          "
        />
      </div>

      {/* DROPDOWN (ONLY WHILE SEARCHING) */}
      {query && (
        <div className="border border-[#E6E6E3] rounded-[10px] bg-white max-h-[180px] overflow-y-auto px-1 py-1 shadow-sm">
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
                px-3 py-2
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
              <span className="text-[16px]">{r.icon || "🌿"}</span>
              <span className="flex-1 text-[14px] text-[#0B0C0A]">
                {r.name}
              </span>
            </button>
          ))}
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
                px-3 py-1
                rounded-[6px]
                bg-[#F1F2F0]
                text-[13px]
                text-[#0B0C0A]
              "
            >
              {r.name}
              <button
                type="button"
                onClick={() =>
                  onChange(selected.filter((s) => s.id !== r.id))
                }
                className="text-[#8E8E8A] hover:text-[#0B0C0A]"
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
