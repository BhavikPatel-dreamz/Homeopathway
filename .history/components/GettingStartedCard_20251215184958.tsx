import React from "react";

export default function GettingStartedCard() {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDECE7] p-6 md:p-8 max-w-[1200px] mx-auto">

      {/* TITLE */}
      <h1 className="font-serif text-[28px] md:text-[32px] lg:text-[40px] text-[#0B0C0A] mb-2">
        Getting Started
      </h1>

      {/* SUBTEXT */}
      <p className="text-[#41463B] text-base leading-7 mb-6">
        If you are new to homeopathy, here are simple steps to help you begin.
      </p>

      {/* STEPS */}
      <div className="space-y-4 text-[#41463B] text-base leading-7">

        <p>
          <span className="font-semibold text-[#0B0C0A]">1. Search for an Ailment</span>
          <br />
          Use HomeoPathway’s search feature to find ailments you are interested in
          and explore which remedies people have tried for those concerns.
        </p>

        <p>
          <span className="font-semibold text-[#0B0C0A]">2. Review Community Insights</span>
          <br />
          Look at remedy effectiveness scores, user reviews, and notes about dosage
          or timing shared by others.
        </p>

        <p>
          <span className="font-semibold text-[#0B0C0A]">3. Start With Common Remedies</span>
          <br />
          Many beginners experiment with well known remedies such as Arnica,
          Nux Vomica, Aconite, or Chamomilla.
        </p>

        <p>
          <span className="font-semibold text-[#0B0C0A]">4. Keep It Low Risk</span>
          <br />
          Try homeopathy for mild or everyday concerns first. Always seek medical
          care for urgent or serious issues.
        </p>

        <p>
          <span className="font-semibold text-[#0B0C0A]">5. Track Your Experience</span>
          <br />
          Make notes about what you tried, how often you took it, and how your
          symptoms changed. This can help you refine what works for you and
          contribute back to the community later.
        </p>

      </div>
    </div>
  );
}
