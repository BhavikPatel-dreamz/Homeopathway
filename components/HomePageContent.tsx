"use client";

import { useState } from "react";
import HeroSlider from "./HeroSlider";
import PopularAilments from "./PopularAilments";
import TopRatedRemedies from "./TopRatedRemedies";
import { Ailment, Remedy } from "@/types";

interface HomePageContentProps {
  initialAilments: Ailment[];
  initialTopRemedies: Remedy[];
}

export default function HomePageContent({
  initialAilments,
  initialTopRemedies,
}: HomePageContentProps) {
  const [ailments, setAilments] = useState<Ailment[]>(initialAilments);
  const [topRemedies, setTopRemedies] = useState<Remedy[]>(initialTopRemedies);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchResults = (newAilments: Ailment[], newRemedies: Remedy[], query?: string) => {
    setAilments(newAilments);
    setTopRemedies(newRemedies);
    if (query !== undefined) {
      setSearchQuery(query);
    }
  };

  return (
    <div>
      <HeroSlider 
        initialAilments={initialAilments}
        initialTopRemedies={initialTopRemedies}
        onSearchResults={handleSearchResults}
      />
      <PopularAilments 
        ailments={ailments}
        searchQuery={searchQuery}
      />
      <TopRatedRemedies 
        topRemedies={topRemedies}
        searchQuery={searchQuery}
      />
    </div>
  );
}