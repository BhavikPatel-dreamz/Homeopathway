// components/HomeopathyCard.tsx
import React from 'react';

// Use placeholder image URLs. Replace them with your actual image paths.
const IMAGE_REMEDIES: string = "/remedies.png"; 
const IMAGE_HAND: string = "/both-hand.png";     

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
            {/* Left Column Content: Historical, Natural Sources, Potentization */}
            <div className="space-y-10 order-2 lg:order-1">
              
              {/* Historical Foundation */}
              <div>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  A historical foundation
                </h4>
                <p className="text-[#41463B] text-base">
                  In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.
                </p>
              </div>

              {/* Based on natural sources */}
              <div>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Based on natural sources
                </h4>
                <p className="text-[#41463B] text-base">
                  Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
                </p>
              </div>

              {/* Potentization */}
              <div>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Potentization
                </h4>
                <p className="text-[#41463B] text-base">
                  Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively.
                </p>
              </div>

              {/* The 'Used Worldwide' and 'Non Toxic' blocks that were here for small screens are removed,
                  as they will be positioned correctly in the right column regardless of screen size. */}
              
            </div>

            {/* Right Column Content: Top Image, Used Worldwide, Non toxic blocks (stacking) */}
            <div className="space-y-10 order-1 lg:order-2">
              
              {/* Top Image: Using fixed height for better visual control on large screens */}
              <div className="relative w-full h-64 sm:h-80 lg:h-[350px] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={IMAGE_REMEDIES}
                  alt="A cup of herbal tea next to a book and natural homeopathic remedies."
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Used worldwide - Now visible on ALL screens as part of the content flow */}
              <div>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Used worldwide
                </h4>
                <p className="text-[#41463B] text-base">
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approachand integrate it with conventional care.
                </p>
              </div>
              
              {/* Non toxic and gentle - Now visible on ALL screens as part of the content flow */}
              <div>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Non toxic and gentle
                </h4>
                <p className="text-[#41463B] text-base">
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </p>
              </div>

            </div>
          </div>
          
          {/* Section with the hand image - Full width - This must be outside the main grid to span the whole width visually,
              but since the text below it (Why HomeoPathway) is full width, we keep it separate and let the image/text stack naturally.
              The provided image shows this section spanning two columns below the main content.
              Therefore, we will place it in a new two-column grid. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
             {/* Image: Bottom Image - Fixed height for better visual control */}
             <div className="relative w-full h-64 sm:h-80 lg:h-[300px] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={IMAGE_HAND}
                  alt="A hand reaching for a small bottle of homeopathic pills."
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Placeholder/Space Filler: Removed all hidden text to eliminate unnecessary space */}
              <div className="flex flex-col justify-end">
                {/* Intentionally left blank, or can be used for more text if the design requires it. 
                   If the image layout required text *next to* this second image, we would place it here.
                   However, the design shows this as an image spanning its column, with the next section below. */}
              </div>
          </div>


          {/* Why HomeoPathway Exists? - This section is full-width, which is correct */}
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