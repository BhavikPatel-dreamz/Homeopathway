import Breadcrumb from "@/components/Breadcrumb";
import GettingStartedCard from "@/components/GettingStartedCard";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Getting Started", isActive: true },
        ]}
      />

      <GettingStartedCard />
    </div>
  );
}
