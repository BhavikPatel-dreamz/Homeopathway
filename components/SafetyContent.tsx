import React, { ReactNode } from "react";

/* ---------- Checklist Item ---------- */
interface SafetyChecklistItemProps {
  children: ReactNode;
}

const SafetyChecklistItem: React.FC<SafetyChecklistItemProps> = ({ children }) => (
  <div className="flex items-center gap-3">
    <span className="">
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="11" viewBox="0 0 19 11" fill="none">
        <path d="M8.835 6.48417L10.0117 7.66083L17.0667 0.605833L18.245 1.78417L10.0117 10.0175L4.70833 4.71417L5.88667 3.53583L7.6575 5.30667L8.835 6.48333V6.48417ZM8.83667 4.1275L12.9633 0L14.1383 1.175L10.0117 5.3025L8.83667 4.1275ZM6.48083 8.84L5.30333 10.0175L0 4.71417L1.17833 3.53583L2.35583 4.71333L2.355 4.71417L6.48083 8.84V8.84Z" fill="#41463B"/>
      </svg>
    </span>
    <p className="text-[#41463B] font-medium text-base leading-[24px]">
      {children}
    </p>
  </div>
);

/* ---------- MAIN CONTENT ---------- */
export default function SafetyContent() {
  return (
    <section className="bg-[#F5F1E8] pt-3 pb-[40px] bg-[#F5F1E8]">
      <div className="max-w-[1268px] mx-auto px-4">
        <div className="bg-white rounded-[8px] border-0 md:p-6 p-4">
          
            {/* PAGE TITLE */}
            <h1 className="font-sans text-[40px] leading-[48px] font-normal text-[#0B0C0A] mb-4">
              Safety and Research
            </h1>

            {/* INTRO TEXT */}
            <p className="text-[#41463B] font-medium text-base leading-[24px] mb-5">
              Homeopathic remedies are generally considered safe because of their high dilutions,
              but it is still important to use them responsibly.
            </p>

            {/* IMAGE + SAFETY LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-[586px_1fr] gap-6 items-start">

              {/* IMAGE — LARGE */}
              <img
                src="/safety.png"
                alt="Preparing homeopathic remedies"
                className="w-[586px] h-[336px] object-cover rounded-[8px]"
              />

              {/* SAFETY CONSIDERATIONS — SMALLER */}
              <div>
                <h2 className="font-family-montserrat text-xl text-[#0B0C0A] leading-[28px] mb-3">
                  Safety Considerations
                </h2>

                <div className="flex flex-col gap-4">
                  <SafetyChecklistItem>
                    Remedies are usually non toxic and have minimal risk of interactions.
                  </SafetyChecklistItem>

                  <SafetyChecklistItem>
                    They should not be used as a replacement for emergency or life saving medical care.
                  </SafetyChecklistItem>

                  <SafetyChecklistItem>
                    Children, pregnant individuals, or anyone with chronic conditions should consult a healthcare professional before trying a new remedy.
                  </SafetyChecklistItem>

                  <SafetyChecklistItem>
                    If symptoms worsen or do not improve, a qualified medical provider should be consulted.
                  </SafetyChecklistItem>
                </div>
              </div>
            </div>

            {/* DISCLAIMER SECTION */}
            <div className="flex flex-col mt-4">

              <h2 className="font-family-montserrat mb-2 text-xl text-[#0B0C0A] leading-[28px]">
                Important Disclaimer
              </h2>

              <p className="text-[#41463B] font-medium text-base leading-[24px] mb-5">
                HomeoPathway is an informational platform that provides community submitted experiences,
                remedy comparisons, and general reference material about homeopathy. The content on this
                site is not medical advice, diagnosis, or treatment. Nothing on HomeoPathway should be
                used as a substitute for professional medical care.
              </p>

              <p className="text-[#41463B] font-medium text-base leading-[24px] mb-5">
                Homeopathy can be helpful for everyday, non emergency situations, but it should not
                replace conventional medical evaluation when needed. If you are experiencing severe,
                new, worsening, or concerning symptoms, you should seek immediate medical attention
                from a licensed healthcare professional. If you have a chronic health condition, are
                pregnant, breastfeeding, or are giving remedies to children, consult a qualified
                professional before using any homeopathic product.
              </p>

              <p className="text-[#41463B] font-medium text-base leading-[24px] mb-5">
                Some individuals report positive outcomes, while others may not experience changes.
                Individual results cannot be predicted, and the information on this website should be
                interpreted with caution. HomeoPathway does not endorse any specific remedy, potency,
                brand, or protocol.
              </p>

              <p className="text-[#41463B] font-medium text-base leading-[24px]">
                By using HomeoPathway, you acknowledge that you are responsible for your own health
                decisions and that any actions you take based on the information here are at your own
                discretion and risk. If you are unsure about any health related concern, always seek
                guidance from a licensed healthcare provider.
              </p>
            </div>

        </div>
      </div>
    </section>
  );
}
