import React from "react";

const IMAGE_REMEDIES = "/remedies.png";
const IMAGE_HAND = "/both-hand.png";

// Body text
const BODY_TEXT =
  "font-montserrat text-[#41463B] text-base font-medium leading-7";

// Sub-headings
const SUB_HEADING_STYLE =
  "font-montserrat text-xl font-semibold leading-7 text-[#0B0C0A]";

// Main titles
const MAIN_TITLE_STYLE =
  "font-sans text-[40px] font-normal text-[#0B0C0A]";

// Reusable content block
const ContentBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <h3 className={SUB_HEADING_STYLE}>{title}</h3>
    <p className={BODY_TEXT}>{children}</p>
  </div>
);

export default function HomeopathyPage() {
  return (
    <section className="bg-[#F5F1E8] py-16">
      <div className="max-w-[1268px] mx-auto px-4">
        <div className="bg-white rounded-[16px] border border-[#EDECE7] p-6">

          {/* TITLE */}
          <h1 className={`${MAIN_TITLE_STYLE} mb-4`}>
            What is Homeopathy?
          </h1>

          {/* INTRO */}
          <p className={BODY_TEXT}>
            Homeopathy is a complementary system of medicine founded over 200 years ago
            by the German physician Dr. Samuel Hahnemann. He observed that the body has
            an inherent ability to heal itself and developed a therapeutic approach
            based on how the body responds to certain substances.
          </p>

          <p className={`${BODY_TEXT} mt-4 mb-6`}>
            Homeopathy is built on a few key ideas:
          </p>

          {/* SECTION 1 — IMAGE FIXED 586×336 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6 order-2 lg:order-1">
              <ContentBlock title="A historical foundation">
                In the late 1700s, Hahnemann noticed that taking certain substances in
                large amounts produced specific symptoms. When these same substances
                were given in extremely small, highly diluted forms, many individuals
                reported relief from similar symptoms.
              </ContentBlock>

              <ContentBlock title="Based on natural sources">
                Homeopathic remedies come from plant materials such as Arnica,
                Belladonna, and Chamomilla, minerals like Natrum Muriaticum and
                Sulphur, and various organic substances.
              </ContentBlock>
            </div>

            {/* IMAGE 1 */}
            <div className="order-1 lg:order-2 flex justify-end">
              <img
                src={IMAGE_REMEDIES}
                alt="Natural homeopathic remedies"
                className="w-[586px] h-[336px] rounded-[16px] object-cover"
              />
            </div>
          </div>

          {/* POTENTIZATION */}
          <div className="mt-6 max-w-[586px]">
            <ContentBlock title="Potentization">
              Although remedies become highly diluted, homeopathic theory holds that
              this process enhances the energetic properties of the original substance.
            </ContentBlock>
          </div>

          {/* SECTION 3 — IMAGE FIXED 586×336 */}
          <div className="mt-8 flex justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px] items-center">

              {/* IMAGE 2 */}
              <img
                src={IMAGE_HAND}
                alt="Homeopathic pills in hand"
                className="w-[586px] h-[336px] rounded-[16px] object-cover"
              />

              {/* TEXT */}
              <div className="space-y-6">
                <ContentBlock title="Used worldwide">
                  Homeopathy is practiced in many parts of the world, including Europe,
                  South Asia, South America, and the United States. Some people use it
                  for common everyday concerns, while others take a more classical
                  approach and integrate it with conventional care.
                </ContentBlock>

                <ContentBlock title="Non toxic and gentle">
                  Because remedies are highly diluted, they are typically safe for a
                  wide range of users, including children and older adults. However,
                  individuals should use their own judgement and consult appropriate
                  care when needed.
                </ContentBlock>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-10">
            <h2 className={`${MAIN_TITLE_STYLE} mb-4`}>
              Why HomeoPathway Exists?
            </h2>
            <p className={BODY_TEXT}>
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
