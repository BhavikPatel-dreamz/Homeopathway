// components/HomeopathyCard.tsx
import React from 'react';

// Use placeholder image URLs. Replace them with your actual image paths.
const IMAGE_REMEDIES: string = "/remedies.png"; 
const IMAGE_HAND: string = "/both-hand.png";     

// Utility component for consistent section layout (declared outside the main component)
interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, children, className = '' }) => (
    <div className={className}>
      <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
        {title}
      </h4>
      <p className="text-[#41463B] text-base">
        {children}
      </p>
    </div>
);


const HomeopathyCard: React.FC = () => {
  return (
    <section className="bg-[#F5F1E8] py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Card Container */}
        <div className="bg-white p-6 md:p-10 lg:p-12 shadow-xl rounded-lg border border-[#EDECE7]">
          
          {/* Header */}
          <h2 className="text-[28px] md:text-[34px] lg:text-[40px] font-bold text-[#41463B] mb-6">
            What is Homeopathy?
          </h2>
          <p className="text-[#41463B] text-base mb-8 border-b border-[#EDECE7] pb-6">
            Homeopathy is a complementary system of medicine founded over 200 years ago by the German physician Dr. Samuel Hahnemann. He observed that the body has an inherent ability to heal itself and developed a therapeutic approach based on how the body responds to certain substances.
          </p>

          <h3 className="text-[22px] md:text-[24px] lg:text-[28px] font-semibold text-[#41463B] mb-6">
            Homeopathy is built on a few key ideas:
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            {/* Left Column Content */}
            <div className="space-y-10 order-2 lg:order-1">
              
              {/* Historical Foundation */}
              <ContentSection title="A historical foundation">
                In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.
              </ContentSection>

              {/* Based on natural sources */}
              <ContentSection title="Based on natural sources">
                Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
              </ContentSection>

              {/* Potentization */}
              <ContentSection title="Potentization">
                Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively.
              </ContentSection>

              {/* Used worldwide / Non toxic and gentle - Grouped for layout matching the image (Visible on small screens) */}
              <div className='lg:hidden space-y-10'>
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

            {/* Right Column Content - Image & Used Worldwide / Non toxic blocks */}
            <div className="space-y-10 order-1 lg:order-2">
              
              {/* Top Image */}
              <div className="aspect-w-16 aspect-h-9 sm:aspect-h-7 lg:aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={IMAGE_REMEDIES}
                  alt="A cup of herbal tea next to a book and natural homeopathic remedies."
                  className="object-cover w-full h-full"
                  // Image tag from the original context
                />
              </div>
              
              {/* Used worldwide - Only visible on large screens to match the column layout */}
              <ContentSection title="Used worldwide" className='hidden lg:block'>
                Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approachand integrate it with conventional care.
              </ContentSection>
              
              {/* Non toxic and gentle - Only visible on large screens to match the column layout */}
              {/* This is the section where the previous error was likely occurring, now fixed by using ContentSection component */}
              <ContentSection title="Non toxic and gentle" className='hidden lg:block'>
                Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
              </ContentSection>

            </div>
          </div>
          
          {/* Section with the hand image - Full width layout based on the single column mobile view */}
          <div className="grid grid-cols-1 mt-10">
             {/* Image */}
             {/* The image is shown after 'Potentization' in the flow, so we place the second image here. */}
             <div className="aspect-w-16 aspect-h-9 sm:aspect-h-7 lg:aspect-h-9 rounded-lg overflow-hidden shadow-lg lg:max-w-md">
                <img
                  src={IMAGE_HAND}
                  alt="A hand reaching for a small bottle of homeopathic pills."
                  className="object-cover w-full h-full"
                  // Image tag from the original context
                />
             </div>
          </div>


          {/* Why HomeoPathway Exists? */}
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