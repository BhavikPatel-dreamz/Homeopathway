import Breadcrumb from '@/components/Breadcrumb';
import SafetyContent from '@/components/SafetyContent'; // Import the new component
import React from 'react';

export default function page() {
  return (
    // The main wrapper class matches the source background color
    <div className="min-h-screen bg-[#F5F1E8]"> 
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: "Back to home", href: "/" },
          { label: "Safety & Research", isActive: true }
        ]} 
      />
      
      {/* Header Section - Adjusted to match the color and structure of the image card's header */}
      <section className="px-4 py-12 lg:py-20 bg-[#f5f3ed] main-wrapper border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className='text-4xl font-serif text-gray-800'>Safety & Research</h1>
        </div>
      </section>
      
      {/* Main Content Area - Renders the structured safety information */}
      <main className="px-4 pt-8 pb-12">
        <SafetyContent />
      </main>
      
    </div>
  );
}