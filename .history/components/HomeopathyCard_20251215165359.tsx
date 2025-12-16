// components/HomeopathyCard.tsx
import React from "react";

const IMAGE_REMEDIES = "/remedies.png";
const IMAGE_HAND = "/both-hand.png";

const HomeopathyCard: React.FC = () => {
  return (
    <section className="bg-[#F5F1E8] py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-lg shadow-md border border-[#EDECE7] p-6 md:p-10">

          {/* Breadcrumb (optional – visible in image) */}
          <p className="text-sm text-gray-500 mb-4">
            Home / About / What is Homeopathy?
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#41463B] mb-6">
            What is Homeopathy?
          </h1>

          {/* Intro */}
          <p className="text-[#41463B] text-base leading-7 border-b border-[#EDECE7] pb-6 mb-8">
            Homeopathy is a complementary system of medicine founded over 200 years ago
            by the German physician Dr. Samuel Hahnemann. He observed that the body has
            an inherent ability to heal itself and developed a therapeutic approach
            based on how the body responds to certain substances.
          </p>

          {/* Two column section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* LEFT CONTENT */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-[#41463B] mb-2">
                  A historical foundation
                </h3>
                <p className="text-[#41463B] leading-7">
                  In the late 1700s, Hahnemann noticed that taking certain substances
                  in large amounts produced specific symptoms. When those same
                  substances were given in extremely small, highly diluted forms,
                  many individuals reported relief from similar symptoms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#41463B] mb-2">
                  Based on natural sources
                </h3>
                <p className="text-[#41463B] leading-7">
                  Homeopathic remedies come from plant materials such as Arnica,
                  Belladonna, and Chamomilla, minerals like Natrum Muriaticum and
                  Sulphur, and various organic substances.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#41463B] mb-2">
                  Potentization
                </h3>
                <p className="text-[#41463B] leading-7">
                  Although remedies become highly diluted, homeopathic theory holds
                  that this process enhances the energetic properties of the original
                  substance.
                </p>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div>
              <img
                src={IMAGE_REMEDIES}
                alt="Natural homeopathic remedies"
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
          </div>

          {/* Second section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">

            {/* Image */}
            <div>
              <img
                src={IMAGE_HAND}
                alt="Homeopathic pills in hand"
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>

            {/* Text */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-[#41463B] mb-2">
                  Used worldwide
                </h3>
                <p className="text-[#41463B] leading-7">
                  Homeopathy is practiced in many parts of the world, including
                  Europe, South Asia, South America, and the United States.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#41463B] mb-2">
                  Non toxic and gentle
                </h3>
                <p className="text-[#41463B] leading-7">
                  Because remedies are highly diluted, they are typically safe for
                  a wide range of users, including children and older adults.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-[#EDECE7] mt-12 pt-8">
            <h2 className="text-3xl font-bold text-[#41463B] mb-4">
              Why HomeoPathway Exists?
            </h2>
            <p className="text-[#41463B] leading-7">
              Homeopathy can feel overwhelming because there are many remedies and
              detailed symptom patterns. HomeoPathway helps by organizing real user
              experiences, remedy insights, and community reported outcomes in one
              place.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeopathyCard;
