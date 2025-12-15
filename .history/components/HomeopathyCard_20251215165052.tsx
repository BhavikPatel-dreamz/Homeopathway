// components/HomeopathyCard.tsx
import React from 'react';

// Use placeholder image URLs. Replace them with your actual image paths.
// NOTE: I'm making sure to place them in the correct flow to match the original design.
const IMAGE_REMEDIES: string = "/remedies.png"; 
const IMAGE_HAND: string = "/both-hand.png";     

const HomeopathyCard: React.FC = () => {
  // A helper component to wrap the content sections for consistent styling
  const ContentSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
        {title}
      </h4>
      <p className="text-[#41463B] text-base">
        {children}
      </p>
    </div>
  );

  return (
    <section className="bg-[#F5F1E8] py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Card Container */}
        <div className="bg-white p-6 md:p-10 lg:p-12 shadow-xl rounded-lg border border-[#EDECE7]">
          
          {/* Header Section */}
          <h2 className="text-[28px] md:text-[34px] lg:text-[40px] font-bold text-[#41463B] mb-6">
            What is Homeopathy?
          </h2>
          <p className="text-[#41463B] text-base mb-8 border-b border-[#EDECE7] pb-6">
            Homeopathy is a complementary system of medicine founded over 200 years ago by the German physician Dr. Samuel Hahnemann. He observed that the body has an inherent ability to heal itself and developed a therapeutic approach based on how the body responds to certain substances.
          </p>

          {/* Key Ideas Header */}
          <h3 className="text-[22px] md:text-[24px] lg:text-[28px] font-semibold text-[#41463B] mb-6">
            Homeopathy is built on a few key ideas:
          </h3>

          {/* Core Two-Column Grid for Text and Image 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Left Column (Main Text Content) */}
            <div className="space-y-10 order-2 lg:order-1">
              
              {/* A historical foundation */}
              <ContentSection title="A historical foundation">
                In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.
              </ContentSection>

              {/* Based on natural sources */}
              <ContentSection title="Based on natural sources">
                Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
              </ContentSection>
            </div>

            {/* Right Column (Image 1) */}
            <div className="order-1 lg:order-2">
              {/* Top Image */}
              <div className="aspect-w-16 aspect-h-9 sm:aspect-h-7 lg:aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={IMAGE_REMEDIES}
                  alt="A cup of herbal tea next to a book and natural homeopathic remedies."
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            
            {/* The remaining key ideas continue below the first image, 
                spanning both columns in the mobile view, but flowing correctly.
                The rest of the content is best handled outside the direct grid
                to manage the flow of Image 2, Potentization, Used Worldwide, 
                and Non Toxic/Gentle as they appear.
            */}
          </div>
          
          {/* Section with Potentization and Image 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mt-10">
            {/* Potentization (Left Column) */}
            <div className="space-y-10">
              <ContentSection title="Potentization">
                Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively.
              </ContentSection>
            </div>
            
            {/* Empty space on Desktop, but acts as the second image container on Mobile */}
            <div className="hidden lg:block">
              {/* This space is intentionally left blank on desktop to match the original two-column flow */}
            </div>
          </div>
          
          {/* Image 2 (Full Width on Mobile, spans both content columns visually) */}
          {/* We'll use a full-width container for the image and then the next two text blocks 
              will be placed next to it on desktop.
          */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mt-10">
             {/* Image - Left side on desktop, top on mobile */}
             <div className="aspect-w-16 aspect-h-9 sm:aspect-h-7 lg:aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={IMAGE_HAND}
                  alt="A hand reaching for a small bottle of homeopathic pills."
                  className="object-cover w-full h-full"
                />
              </div>

             {/* Used worldwide & Non toxic and gentle - Right side on desktop, bottom on mobile */}
             <div className="space-y-10">
                {/* Used worldwide */}
                <ContentSection title="Used worldwide">
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approachand integrate it with conventional care.
                </ContentSection>
                
                {/* Non toxic and gentle */}
                <ContentSection title="Non toxic and gentle">
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </ContentSection>
             </div>
          </div>

          {/* Why HomeoPathway Exists? - Full Width Section */}
          {/* The line separator and margin should be placed *before* this section starts */}
          <div className="pt-10 border-t border-[#EDECE7] mt-10">
             <h2 className="text-[28px] md:text-[34px] lg:text-[40px] font-bold text-[#41463B] mb-4">
                Why HomeoPathway Exists?
             </h2>
             <p className="text-[#41463B] text-base">
                Homeopathy can feel overwhelming because there are many remedies and detailed symptom patterns. HomeoPathway helps by organizing real user experiences, remedy insights, and community reported outcomes in one place, making it easier for people to learn from others and explore what has worked for different symptoms.
             </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}

export default HomeopathyCard;