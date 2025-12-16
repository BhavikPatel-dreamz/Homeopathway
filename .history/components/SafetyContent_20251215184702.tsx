import React, { ReactNode } from "react";

/* ---------- Checklist Item ---------- */
interface SafetyChecklistItemProps {
  children: ReactNode;
}

const SafetyChecklistItem: React.FC<SafetyChecklistItemProps> = ({ children }) => (
  <div className="flex items-start gap-2">
    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
    <p className="text-[#41463B] text-base leading-7">{children}</p>
  </div>
);

/* ---------- MAIN CONTENT ---------- */
export default function SafetyContent() {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDECE7] p-6 md:p-10 max-w-[1200px] mx-auto">

      {/* PAGE TITLE (NO LINE BELOW) */}
      <h1 className="font-serif text-3xl md:text-4xl text-[#0B0C0A] mb-4">
        Safety and Research
      </h1>

      {/* INTRO TEXT */}
      <p className="text-[#41463B] text-base leading-7 mb-8">
        Homeopathic remedies are generally considered safe because of their high dilutions,
        but it is still important to use them responsibly.
      </p>

      {/* IMAGE + SAFETY LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-10">

        {/* IMAGE */}
        <img
          src="/safety.png"
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

      {/* IMPORTANT DISCLAIMER — NO LINE ABOVE */}
      <h2 className="font-serif text-xl text-[#0B0C0A] mb-4">
        Important Disclaimer
      </h2>

      <div className="space-y-4 text-[#41463B] text-base leading-7">
        <p>
          HomeoPathway is an informational platform that provides community submitted experiences, remedy comparisons, and general reference material about homeopathy. The content on this site is not medical advice, diagnosis, or treatment. Nothing on HomeoPathway should be used as a substitute for professional medical care.
        </p>

        <p>
          Homeopathy can be helpful for everyday, non emergency situations, but it should not replace conventional medical evaluation when needed. If you are experiencing severe, new, worsening, or concerning symptoms, you should seek immediate medical attention from a licensed healthcare professional. If you have a chronic health condition, are pregnant, breastfeeding, or are giving remedies to children, consult a qualified professional before using any homeopathic product.
        </p>

        <p>
          Some individuals report positive outcomes, while others may not experience changes. Individual results cannot be predicted, and the information on this website should be interpreted with caution. HomeoPathway does not endorse any specific remedy, potency, brand, or protocol.
        </p>


        <p>
          By using HomeoPathway, you acknowledge that you are responsible for your own health decisions and that any actions you take based on the information here are at your own discretion and risk. If you are unsure about any health related concern, always seek guidance from a licensed healthcare provider.
        </p>

      </div>

    </div>
  );
}
