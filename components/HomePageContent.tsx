import HeroSlider from "./HeroSlider";

import { Ailment, Remedy } from "@/types";
import PopularAilmentsServer from "./PopularAilmentsServer";
import TopRatedRemediesServer from "./TopRatedRemediesServer";
import Footer from "./Footer";

interface HomePageContentProps {
  initialAilments: Ailment[];
  initialTopRemedies: Remedy[];
}

export default function HomePageContent({
  initialAilments,
  initialTopRemedies,
}: HomePageContentProps) {
  return (
    <div>
      <HeroSlider />
      <PopularAilmentsServer 
        ailments={initialAilments}
      />
      <TopRatedRemediesServer 
        topRemedies={initialTopRemedies}
      />
      <Footer/>
    </div>
  );
}