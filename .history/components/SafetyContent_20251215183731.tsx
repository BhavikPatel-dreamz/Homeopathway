import React, { ReactNode } from "react";

/* ---------- Checklist Item ---------- */
interface SafetyChecklistItemProps {
  children: ReactNode;
}

const SafetyChecklistItem: React.FC<SafetyChecklistItemProps> = ({ children }) => (
  <div className="flex items-start gap-2">
    <span className="text-green-600 font-bold text-lg">✓</span>
    <p className="text-[#41463B] text-base leading-7">{children}</p>
  </div>
);

/* ---------- MAIN CONTENT ---------- */
export default function SafetyContent() {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDECE7] p-6 md:p-10 max-w-[1200px] mx-auto">

      {/* CARD TITLE (ONLY ONE) */}
      <h1 className="font-serif text-3xl md:text-4xl text-[#0B0C0A] mb-4">
        Safety and Research
      </h1>

      <hr className="border-[#EDECE7] mb-6" />

      {/* INTRO */}
      <p className="text-[#41463B] text-base leading-7 mb-8">
        Homeopathic remedies are generally considered safe because of their high dilutions,
        but it is still important to use them responsibly.
      </p>

      {/* IMAGE + SAFETY LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* IMAGE */}
        <img
          src="/Card_1.jpg"
          alt="Preparing homeopathic remedies"
          className="w-full h-[336px] object-cover rounded-[16px]"
        />

        {/* SAFETY CONSIDERATIONS */}
        <div className="bg-[#FAFAF8] border border-[#EDECE7] rounded-[16px] p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#0B0C0A] mb-2">
            Safety Considerations
          </h2>

          <SafetyChecklistItem>
            Remedies are usually non toxic and have minimal risk of interactions.
          </SafetyChecklistItem>

          <SafetyChecklistItem>
            They should not be used as a replacement for emergency or life saving medical care.
          </SafetyChecklistItem>

          <SafetyChecklistItem>
            Children, pregnant individuals, or those with chronic conditions should consult
            a healthcare professional before trying a new remedy.
          </SafetyChecklistItem>

          <SafetyChecklistItem>
            If symptoms worsen or do not improve, consult a qualified medical provider.
          </SafetyChecklistItem>
        </div>
      </div>

      {/* DISCLAIMER */}
      <hr className="border-[#EDECE7] my-10" />

      <h2 className="font-serif text-xl text-[#0B0C0A] mb-4">
        Important Disclaimer
      </h2>

      <div className="space-y-4 text-[#41463B] text-base leading-7">
        <p>
          HomeoPathway is an informational platform providing community submitted experiences,
          remedy comparisons, and general reference material about homeopathy. This content is
          not medical advice.
        </p>

        <p>
          Homeopathy should not replace conventional medical evaluation. If symptoms are severe,
          worsening, or concerning, seek immediate medical attention.
        </p>

        <p>
          Individual results vary. HomeoPathway does not endorse any specific remedy, potency,
          brand, or protocol.
        </p>

        <p className="text-sm italic pt-4 border-t border-[#EDECE7]">
          By using HomeoPathway, you acknowledge responsibility for your own health decisions.
          Always consult a licensed healthcare provider when in doubt.
        </p>
      </div>

    </div>
  );
}
