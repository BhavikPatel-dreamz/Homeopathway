import React from "react";

export default function GettingStartedCard() {
  return (
    /* PAGE WRAPPER (handles all spacing & centering) */
    <section className="bg-[#F5F1E8] pt-3 pb-[40px] bg-[#F5F1E8]">
      <div className="max-w-[1268px] mx-auto px-4">
        {/* CARD */}
        <div className="bg-white rounded-[8px] border-0 md:p-6 p-4">
          {/* INNER CONTENT */}
          <div
            className="
              flex flex-col
              w-full
            "
          >
            {/* TITLE */}
            <h1 className="font-sans text-[40px] leading-[48px] font-normal text-[#0B0C0A] mb-4">
              Getting Started
            </h1>

            {/* SUBTITLE */}
            <p className="text-[#41463B] font-medium text-[16px] leading-[24px] mb-4">
              If you are new to homeopathy, here are simple steps to help you begin.
            </p>

            {/* STEPS */}
            <div className="flex flex-col text-[#41463B] text-[16px] leading-[24px] font-medium">
              <p className="mb-5">
                <h3 className="font-semibold text-[#0B0C0A] font-family-montserrat text-[20px] leading-[28px] mb-3">
                  1. Search for an Ailment
                </h3>
                Use HomeoPathway’s search feature to find ailments you are interested
                in and explore which remedies people have tried for those concerns.
              </p>

              <p className="mb-5">
                <h3 className="font-semibold text-[#0B0C0A] font-family-montserrat text-[20px] leading-[28px] mb-3">
                  2. Review Community Insights
                </h3>
                Look at remedy effectiveness scores, user reviews, and notes about
                dosage or timing shared by others.
              </p>

              <p className="mb-5">
                <h3 className="font-semibold text-[#0B0C0A] font-family-montserrat text-[20px] leading-[28px] mb-3">
                  3. Start With Common Remedies
                </h3>
                Many beginners experiment with well known remedies such as Arnica,
                Nux Vomica, Aconite, or Chamomilla.
              </p>

              <p className="mb-5">
                <h3 className="font-semibold text-[#0B0C0A] font-family-montserrat text-[20px] leading-[28px] mb-3">
                  4. Keep It Low Risk
                </h3>
                Try homeopathy for mild or everyday concerns first. Always seek
                medical care for urgent or serious issues.
              </p>

              <p>
                <h3 className="font-semibold text-[#0B0C0A] font-family-montserrat text-[20px] leading-[28px] mb-3">
                  5. Track Your Experience
                </h3>
                Make notes about what you tried, how often you took it, and how your
                symptoms changed. This can help you refine what works for you and
                contribute back to the community later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
