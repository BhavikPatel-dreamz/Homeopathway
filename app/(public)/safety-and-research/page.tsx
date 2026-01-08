import Breadcrumb from "@/components/Breadcrumb";
import SafetyContent from "@/components/SafetyContent";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">

      {/* Breadcrumb (KEEP – matches original) */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Safety & Research", isActive: true }
        ]}
      />

      {/* MAIN CONTENT */}      
        <SafetyContent />
    </div>
  );
}
