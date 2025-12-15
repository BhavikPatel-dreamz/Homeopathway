// components/HomeopathyCard.tsx
import React from 'react';

// Use placeholder image URLs. Replace them with your actual image paths.
const IMAGE_REMEDIES: string = "/remedies.jpg"; 
const IMAGE_HAND: string = "/both-hand.jpg";     // Corresponds to the image of the hand holding the bottle

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

              {/* Used worldwide / Non toxic and gentle - Grouped for layout matching the image (Visible on small screens) */}
              <div className='lg:hidden'>
                {/* Used worldwide */}
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Used worldwide
                </h4>
                <p className="text-[#41463B] text-base">
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approachand integrate it with conventional care.
                </p>
              </div>

              <div className='lg:hidden'>
                {/* Non toxic and gentle */}
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Non toxic and gentle
                </h4>
                <p className="text-[#41463B] text-base">
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </p>
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
                />
              </div>
              
              {/* Used worldwide - Only visible on large screens to match the column layout */}
              <div className='hidden lg:block'>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Used worldwide
                </h4>
                <p className="text-[#41463B] text-base">
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approachand integrate it with conventional care.
                </p>
              </div>
              
              {/* Non toxic and gentle - Only visible on large screens to match the column layout */}
              <div className='hidden lg:block'>
                <h4 className="text-[20px] font-bold text-[#41463B] mb-3">
                  Non toxic and gentle
                </h4>
                <p className="text-[#41463B] text-base">
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </p>
              </div>

            </div>
          </div>
          
          {/* Section with the hand image - Full width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
             {/* Image */}
             <div className="aspect-w-16 aspect-h-9 sm:aspect-h-7 lg:aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={IMAGE_HAND}
                  alt="A hand reaching for a small bottle of homeopathic pills."
                  className="object-cover w-full h-full"
                />
              </div>

             
              <div className="flex flex-col justify-end">
                 <h4 className="text-[20px] font-bold text-[#41463B] mb-3 hidden">
                   Image Placeholder Text
                 </h4>
                 <p className="text-[#41463B] text-base italic hidden">
                   The original image content had the &quot;Used worldwide&quot; and &quot;Non toxic and gentle&quot; text blocks next to two different images. In this recreation, they are placed in the main two-column grid to better match the final layout, leaving this space for introductory text to the next section if needed.
                 </p>
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