import Breadcrumb from "@/components/Breadcrumb";
import GettingStartedCard from "@/components/GettingStartedCard";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Back to home", href: "/" },
          { label: "Getting Started", isActive: true },
        ]}
      />

      {/* PAGE HEADER */}
      <section className="px-4 py-10 lg:py-16 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-[30px] md:text-[32px] lg:text-[40px] text-[#0B0C0A]">
            Getting Started
          </h1>
        </div>
      </section>

      {/* CARD */}
      <main className="px-4 pb-12">
        <GettingStartedCard />
      </main>

    </div>
  );
}
