// components/HomeopathyCard.tsx
import React from 'react';

// --- Figma/Image-Derived Constants ---

// Colors
const COLOR_BACKGROUND = 'bg-[#F5F1E8]';
const COLOR_CARD_BACKGROUND = 'bg-white';
const COLOR_TEXT_PRIMARY = 'text-[#41463B]';
const COLOR_BORDER = 'border-[#EDECE7]';
const COLOR_FOOTER_BACKGROUND = 'bg-[#41463B]'; // Based on the footer image

// Spacing (Desktop/Figma)
const CARD_PADDING_DESKTOP = 'p-12'; // 24px padding inside the card * 2? The Figma says 24px padding, but 12px margins are more common for a spacious look. I'll use p-12 for the outer container and p-6/p-10/p-12 for the inner card. Let's use the Figma numbers:
const CARD_PADDING_MOBILE = 'p-6';
const CARD_PADDING_LG = 'lg:p-12';

// --- Image Placeholders (Update these paths) ---
// Using hardcoded strings here; replace with your actual asset paths.
const IMAGE_REMEDIES: string = "/remedies.png"; 
const IMAGE_HAND: string = "/both-hand.png";     

const HomeopathyCard: React.FC = () => {
  return (
    // Section Container: Responsible for the outer background color and max-width/centering.
    <section className={`${COLOR_BACKGROUND} pb-20 lg:pb-24`}>
      <div 
        // Max-width and horizontal padding to center the content like in the image. 
        // 96px padding on desktop corresponds to a max-width of ~1248px for 1440px viewport
        className="max-w-[1440px] mx-auto px-6 lg:px-24" 
      >
        {/* Main Card Container: White background, shadow, border, and main content padding */}
        <div 
          className={`${COLOR_CARD_BACKGROUND} ${CARD_PADDING_MOBILE} md:p-10 ${CARD_PADDING_LG} 
            shadow-xl rounded-[20px] border ${COLOR_BORDER} 
            w-full`} // rounded-[20px] based on the Figma "Border Radius/200"
        >
          
          {/* Header */}
          <h2 className={`text-[28px] md:text-[34px] lg:text-[40px] font-bold ${COLOR_TEXT_PRIMARY} mb-6`}>
            What is Homeopathy?
          </h2>
          <p className={`text-base ${COLOR_TEXT_PRIMARY} mb-8 border-b ${COLOR_BORDER} pb-6`}>
            Homeopathy is a complementary system of medicine founded over 200 years ago by the German physician Dr. Samuel Hahnemann. He observed that the body has an inherent ability to heal itself and developed a therapeutic approach based on how the body responds to certain substances.
          </p>

          <h3 className={`text-[22px] md:text-[24px] lg:text-[28px] font-semibold ${COLOR_TEXT_PRIMARY} mb-10`}>
            Homeopathy is built on a few key ideas:
          </h3>

          {/* Key Ideas Grid (Two Columns on Large Screens) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Left Column Content - Order 2 on mobile, Order 1 on desktop */}
            <div className="space-y-10 order-2 lg:order-1">
              
              {/* Historical Foundation */}
              <div className="space-y-3">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  A historical foundation
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.
                </p>
              </div>

              {/* Based on natural sources */}
              <div className="space-y-3">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  Based on natural sources
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
                </p>
              </div>

              {/* Potentization */}
              <div className="space-y-3">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  Potentization
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively.
                </p>
              </div>
              
              {/* Used worldwide (Mobile/Tablet Only) - Placed here to match the mobile image's flow */}
              <div className="space-y-3 lg:hidden">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  Used worldwide
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approach and integrate it with conventional care.
                </p>
              </div>

              {/* Non toxic and gentle (Mobile/Tablet Only) - Placed here to match the mobile image's flow */}
              <div className="space-y-3 lg:hidden">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  Non toxic and gentle
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </p>
              </div>

            </div>

            {/* Right Column Content - Image & Remaining blocks */}
            <div className="space-y-10 order-1 lg:order-2">
              
              {/* Top Image (Herbs/Tea) */}
              <div className="rounded-lg overflow-hidden shadow-lg aspect-square sm:aspect-video lg:aspect-square">
                <img
                  src={IMAGE_REMEDIES}
                  alt="A cup of herbal tea next to a book and natural homeopathic remedies."
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Used worldwide (Desktop Only) */}
              <div className="space-y-3 hidden lg:block">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  Used worldwide
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approach and integrate it with conventional care.
                </p>
              </div>
              
              {/* Non toxic and gentle (Desktop Only) */}
              <div className="space-y-3 hidden lg:block">
                <h4 className={`text-[20px] font-bold ${COLOR_TEXT_PRIMARY}`}>
                  Non toxic and gentle
                </h4>
                <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </p>
              </div>

            </div>
          </div>
          
          {/* Section with the hand image - Full width after the initial grid on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mt-10 lg:mt-16">
             
             {/* Image of hand and pills (Left on desktop/Top on mobile) */}
             <div className="rounded-lg overflow-hidden shadow-lg aspect-square sm:aspect-video lg:aspect-square">
                <img
                  src={IMAGE_HAND}
                  alt="A hand reaching for a small bottle of homeopathic pills."
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Potentization - The mobile image shows the Potentization text right above the hand image,
                  while the desktop version seems to separate it. To match the desktop image (which is 
                  more spread out), I'll treat the content above the hand image as its own section. 
                  However, based on the mobile image, I'll place the remaining content flow here. 
                  Since 'Potentization' is already in the left column on desktop, 
                  this second column is left empty on desktop but keeps the flow on mobile.
              */}
              <div className="hidden lg:flex flex-col justify-end">
                 {/* This space is empty on desktop, allowing the image to stand alone 
                     or be filled with new, un-provided content. I'll remove the placeholder text. */}
              </div>
          </div>


          {/* Why HomeoPathway Exists? - Full-width section */}
          <div className={`pt-10 border-t ${COLOR_BORDER} mt-10 lg:mt-16`}>
             <h2 className={`text-[28px] md:text-[34px] lg:text-[40px] font-bold ${COLOR_TEXT_PRIMARY} mb-4`}>
                Why HomeoPathway Exists?
             </h2>
             <p className={`text-base ${COLOR_TEXT_PRIMARY}`}>
                Homeopathy can feel overwhelming because there are many remedies and detailed symptom patterns. HomeoPathway helps by organizing real user experiences, remedy insights, and community reported outcomes in one place, making it easier for people to learn from others and explore what has worked for different symptoms.
             </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}

export default HomeopathyCard;