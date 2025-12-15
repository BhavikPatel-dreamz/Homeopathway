import React from "react";

const IMAGE_REMEDIES = "/remedies.png";
const IMAGE_HAND = "/both-hand.png";

// Figma subtitle style (Fonts/secondary)
const SUB_TITLE =
  "font-montserrat text-lg font-semibold leading-7 text-[#0B0C0A]";

export default function HomeopathyPage() {
  return (
    <section className="bg-[#F5F1E8] py-10 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="bg-white rounded-[16px] border border-[#EDECE7] p-6 md:p-10">

          {/* PAGE TITLE (Primary font – Geist) */}
          <h1 className="font-sans text-3xl md:text-4xl font-normal text-[#0B0C0A] mb-4">
            What is Homeopathy?
          </h1>

          {/* INTRO (Secondary font) */}
          <p className="font-montserrat text-[#41463B] text-base font-medium leading-7 border-b border-[#EDECE7] pb-6 mb-8 max-w-[900px]">
            Homeopathy is a complementary system of medicine founded over 200 years ago
            by the German physician Dr. Samuel Hahnemann. He observed that the body has
            an inherent ability to heal itself and developed a therapeutic approach
            based on how the body responds to certain substances.
          </p>

          <h2 className={`${SUB_TITLE} mb-6`}>
            Homeopathy is built on a few key ideas:
          </h2>

          {/* ===== ROW 1 ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* LEFT TEXT */}
            <div className="space-y-8">
              <div>
                <h3 className={`${SUB_TITLE} mb-2`}>
                  A historical foundation
                </h3>
                <p className="font-montserrat text-[#41463B] font-medium leading-7">
                  In the late 1700s, Hahnemann noticed that taking certain substances
                  in large amounts produced specific symptoms. When these same
                  substances were given in extremely small, highly diluted forms,
                  many individuals reported relief from similar symptoms.
                </p>
              </div>

              <div>
                <h3 className={`${SUB_TITLE} mb-2`}>
                  Based on natural sources
                </h3>
                <p className="font-montserrat text-[#41463B] font-medium leading-7">
                  Homeopathic remedies come from plant materials such as Arnica,
                  Belladonna, and Chamomilla, minerals like Natrum Muriaticum and
                  Sulphur, and various organic substances.
                </p>
              </div>
            </div>

            {/* IMAGE 1 */}
            <img
              src={IMAGE_REMEDIES}
              alt="Natural homeopathic remedies"
              className="w-full h-auto rounded-[16px] object-cover"
            />
          </div>

          {/* ===== POTENTIZATION (BELOW IMAGE) ===== */}
          <div className="mt-10 max-w-[900px]">
            <h3 className={`${SUB_TITLE} mb-2`}>
              Potentization
            </h3>
            <p className="font-montserrat text-[#41463B] font-medium leading-7">
              Although remedies become highly diluted, homeopathic theory holds
              that this process enhances the energetic properties of the original
              substance, allowing the remedy to work effectively.
            </p>
          </div>

          {/* ===== ROW 3 ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 items-start">

            {/* IMAGE 2 */}
            <img
              src={IMAGE_HAND}
              alt="Homeopathic pills in hand"
              className="w-full h-auto rounded-[16px] object-cover"
            />

            {/* RIGHT TEXT */}
            <div className="space-y-8">
              <div>
                <h3 className={`${SUB_TITLE} mb-2`}>
                  Used worldwide
                </h3>
                <p className="font-montserrat text-[#41463B] font-medium leading-7">
                  Homeopathy is practiced in many parts of the world, including Europe,
                  South Asia, South America, and the United States.
                </p>
              </div>

              <div>
                <h3 className={`${SUB_TITLE} mb-2`}>
                  Non toxic and gentle
                </h3>
                <p className="font-montserrat text-[#41463B] font-medium leading-7">
                  Because remedies are highly diluted, they are typically safe for a
                  wide range of users, including children and older adults.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-[#EDECE7] mt-12 pt-8">
            <h2 className="font-sans text-3xl font-normal text-[#0B0C0A] mb-4">
              Why HomeoPathway Exists?
            </h2>
            <p className="font-montserrat text-[#41463B] font-medium leading-7 max-w-[900px]">
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
}
