// src/components/SafetyCard.tsx
import React from "react";
import Image from "next/image"; // Using next/image for optimized images

// Replace with your actual image path or URL
const cardImageUrl = "/path-to-your-image/Card (1).jpg"; 
// Note: In a real Next.js app, you'd place the image in the 'public' folder 
// and reference it as: src="/Card (1).jpg"

export default function SafetyCard() {
  return (
    // Card Layout: width: 1248 (max-w-7xl in context), height: auto, gap: 16px (internal spacing), border-radius: 8px (200 is too high for a standard radius)
    // Applying a sensible max-width and internal padding
    <div
      className="bg-white p-6 md:p-8 rounded-xl shadow-lg"
      // Custom max-width to approximate the 1248px figma width if needed, 
      // but max-w-7xl is often used for page-wide containers (1280px)
      style={{ maxWidth: '1248px', margin: '0 auto' }} 
    >
      <h2 className="text-3xl md:text-4xl font-semibold text-[#0B0C0A] mb-6">
        Safety and Research
      </h2>
      <p className="text-[#41463B] mb-8">
        Homeopathic remedies are generally considered safe because of their high
        dilutions, but it is still important to use them responsibly.
      </p>

      {/* --- Image and Safety Considerations Section --- */}
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* Image Container */}
        <div className="lg:w-1/2 rounded-lg overflow-hidden flex-shrink-0">
          {/* Note: In a real app, use the actual image path and Next.js Image component */}
          <Image
            src="/Card (1).jpg" 
            alt="Person preparing homeopathic remedies"
            width={600} // Approximate width for the image container
            height={400} // Approximate height
            layout="responsive"
            className="rounded-lg object-cover w-full h-full"
            // Ensure you have an appropriate image loader/source configured for this to work
          />
        </div>

        {/* Safety Considerations Text */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          <h3 className="text-2xl font-semibold text-[#0B0C0A] mb-4">
            Safety Considerations
          </h3>
          <ul className="space-y-3 text-[#41463B]">
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">✓</span>
              <span>
                Remedies are usually non toxic and have minimal risk of
                interactions.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">✓</span>
              <span>
                They should not be used as a replacement for emergency or life
                saving medical care.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">✓</span>
              <span>
                Children, pregnant individuals, or anyone with chronic conditions
                should consult a healthcare professional before trying a new
                remedy.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">✓</span>
              <span>
                If symptoms worsen or do not improve, a qualified medical
                provider should be consulted.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* --- Disclaimer Section --- */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-[#0B0C0A]">
          Important Disclaimer:
        </h3>
        <p className="text-[#41463B]">
          HomeoPathway is an informational platform that provides community
          submitted experiences, remedy comparisons, and general reference
          material about homeopathy. The content on this site is not medical
          advice, diagnosis, or treatment. Nothing on HomeoPathway should be
          used as a substitute for professional medical care.
        </p>
        <p className="text-[#41463B]">
          Homeopathy can be helpful for everyday, non emergency situations, but
          it should not replace conventional medical evaluation when needed. If
          you are experiencing severe, new, worsening, or concerning symptoms,
          you should seek immediate medical attention from a licensed healthcare
          professional. If you have a chronic health condition, are pregnant,
          breastfeeding, or are giving remedies to children, consult a qualified
          professional before using any homeopathic product.
        </p>
        <p className="text-[#41463B]">
          Some individuals report positive outcomes, while others may not
          experience changes. Individual results cannot be predicted, and the
          information on this website should be interpreted with caution.
          HomeoPathway does not endorse any specific remedy, potency, brand, or
          protocol.
        </p>
        <p className="text-[#41463B]">
          By using HomeoPathway, you acknowledge that you are responsible for
          your own health decisions and that any actions you take based on the
          information here are at your own discretion and risk. If you are
          unsure about any health related concern, always seek guidance from a
          licensed healthcare provider.
        </p>
      </div>
    </div>
  );
}