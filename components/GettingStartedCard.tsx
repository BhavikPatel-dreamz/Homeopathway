import React from "react";

export default function GettingStartedCard() {
  return (
    /* PAGE WRAPPER (handles all spacing & centering) */
    <section
      className="
        flex justify-center
        bg-[#F5F1E8]
        px-[16px] pt-[8px] pb-[24px]
        md:px-[96px] md:pt-[12px] md:pb-[40px]
      "
    >
      {/* CARD */}
      <div
        className="
          bg-white border border-[#EDECE7] rounded-[16px]
          w-full max-w-[368px] p-[16px]
          md:max-w-[1248px] md:p-[24px]
        "
      >
        {/* INNER CONTENT */}
        <div
          className="
            flex flex-col gap-[24px]
            w-full
            md:w-[1200px] md:mx-auto
          "
        >
          {/* TITLE */}
          <h1
            className="
              font-serif font-normal text-[#0B0C0A]
              text-[28px] leading-[32px]
              md:text-[32px] md:leading-[36px]
            "
          >
            Getting Started
          </h1>

          {/* SUBTITLE */}
          <p className="text-[#41463B] font-medium text-[16px] leading-[24px]">
            If you are new to homeopathy, here are simple steps to help you begin.
          </p>

          {/* STEPS */}
          <div className="flex flex-col gap-[16px] text-[#41463B] text-[16px] leading-[24px] font-medium">
            <p>
              <span className="font-semibold text-[#0B0C0A]">
                1. Search for an Ailment
              </span>
              <br />
              Use HomeoPathway’s search feature to find ailments you are interested
              in and explore which remedies people have tried for those concerns.
            </p>

            <p>
              <span className="font-semibold text-[#0B0C0A]">
                2. Review Community Insights
              </span>
              <br />
              Look at remedy effectiveness scores, user reviews, and notes about
              dosage or timing shared by others.
            </p>

            <p>
              <span className="font-semibold text-[#0B0C0A]">
                3. Start With Common Remedies
              </span>
              <br />
              Many beginners experiment with well known remedies such as Arnica,
              Nux Vomica, Aconite, or Chamomilla.
            </p>

            <p>
              <span className="font-semibold text-[#0B0C0A]">
                4. Keep It Low Risk
              </span>
              <br />
              Try homeopathy for mild or everyday concerns first. Always seek
              medical care for urgent or serious issues.
            </p>

            <p>
              <span className="font-semibold text-[#0B0C0A]">
                5. Track Your Experience
              </span>
              <br />
              Make notes about what you tried, how often you took it, and how your
              symptoms changed. This can help you refine what works for you and
              contribute back to the community later.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
