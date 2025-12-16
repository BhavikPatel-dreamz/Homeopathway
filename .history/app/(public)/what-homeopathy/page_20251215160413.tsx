import Breadcrumb from '@/components/Breadcrumb'
import React from 'react'
// Note: Assuming '@/components/Breadcrumb' is a functional component 
// that accepts an 'items' prop as shown in your starting code.

export default function HomeopathyPage() {
  // Define image URLs as constants for easy updating.
  // Replace these with the actual image URLs once you have them.
  const imageHerbalTea = "image-of-herbal-tea-and-books-url"; 
  const imageHandHoldingBottle = "image-of-hand-holding-remedy-bottle-url";

  // The Breadcrumb component is assumed to be in '@/components/Breadcrumb'
  // For this example, I'll include a minimal mock implementation for completeness
  // if you were to use this file standalone, but for your environment, 
  // you should rely on your actual component.

  const MockBreadcrumb = ({ items }) => (
    <nav className="text-sm p-4 text-gray-600 bg-white shadow-sm">
      {items.map((item, index) => (
        <span key={item.label}>
          <a 
            href={item.href || '#'} 
            className={item.isActive ? 'font-semibold text-black' : 'hover:text-black'}
          >
            {item.label}
          </a>
          {index < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      
      {/* Header / Breadcrumb Section
        The original image shows the breadcrumb and header title together.
        I will place the Breadcrumb at the top and the main header in its own section,
        as defined in your original component structure. 
      */}
      
      {/* The component you provided for Breadcrumb */}
      {/* <Breadcrumb 
          items={[
            { label: "Back to home", href: "/" },
            { label: "what is homeopathy?", isActive: true }
          ]}
        /> 
      */}
      
      {/* Using the mock for a standalone example, replace with your actual <Breadcrumb> */}
      <MockBreadcrumb 
        items={[
          { label: "Home", href: "/" }, // Modified 'Back to home' for typical breadcrumb
          { label: "About", href: "/about" },
          { label: "What is Homeopathy?", isActive: true } // Matches the image text
        ]}
      />

      {/* Main Header Section - Matches the color and font size of the image's top section */}
      <section className="px-4 py-16 lg:py-24 bg-[#f5f3ed] border-b border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className='text-[30px] md:text-[36px] lg:text-[44px] font-serif text-gray-800 tracking-tight'>
            What is Homeopathy?
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-12 lg:py-20 text-gray-700">
        
        {/* Intro Paragraph */}
        <p className="mb-10 text-lg">
          Homeopathy is a complementary system of medicine founded over 200 years ago by the German physician Dr. Samuel Hahnemann. He observed that the body has an inherent ability to heal itself and developed a therapeutic approach based on how the body responds to certain substances.
        </p>
        <p className="mb-12 text-lg">
          Homeopathy is built on a few key ideas:
        </p>

        {/* --- Key Ideas Grid --- */}
        <div className="space-y-12 lg:space-y-20">

          {/* 1. A historical foundation (Left text, Right image) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-10 items-start">
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">A historical foundation</h2>
              <p className="text-lg leading-relaxed">
                In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.
              </p>
            </div>
            {/* Image Placeholder - Matches the first image in the original layout */}
            <div className="mt-8 lg:mt-0">
              <img 
                src={imageHerbalTea} 
                alt="Herbal ingredients, tea, and books, suggesting natural remedies" 
                className="w-full h-auto object-cover rounded-lg shadow-xl"
                // The original image has a moderate height, so setting a max-h or object-cover is good.
              />
            </div>
          </div>

          {/* 2. Based on natural sources (Full width text) */}
          <div className="max-w-4xl">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">Based on natural sources</h2>
            <p className="text-lg leading-relaxed">
              Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
            </p>
          </div>

          {/* 3. Potentization, Used Worldwide, Non Toxic (Three-part layout: Top, Bottom-Left, Bottom-Right) */}
          <div className="space-y-10 lg:space-y-0">
            
            {/* Potentization (Full width text at the top of this block) */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">Potentization</h2>
              <p className="text-lg leading-relaxed">
                Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively. 
              </p>
            </div>

            {/* Layout for the Bottom-Left Image and Bottom-Right Text Columns */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-10 items-start pt-4">
              
              {/* Image Placeholder (Bottom Left) */}
              <div className="lg:order-1 order-2 mt-8 lg:mt-0"> 
                <img 
                  src={imageHandHoldingBottle} 
                  alt="A hand holding a small bottle of homeopathic remedy" 
                  className="w-full h-auto object-cover rounded-lg shadow-xl"
                  // The original image is more square/portrait, so adjust sizing/aspect ratio as needed
                />
              </div>

              {/* Text Columns (Bottom Right) */}
              <div className="lg:order-2 order-1 space-y-8">
                
                {/* Used worldwide */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-gray-800">Used worldwide</h2>
                  <p className="text-lg leading-relaxed">
                    Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approach and integrate it with conventional care.
                  </p>
                </div>

                {/* Non toxic and gentle */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-gray-800">Non toxic and gentle</h2>
                  <p className="text-lg leading-relaxed">
                    Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* --- Why HomeoPathway Exists? --- */}
        <div className="mt-16 lg:mt-24 pt-10 border-t border-gray-300">
          <h1 className='text-[30px] md:text-[36px] font-serif text-gray-800 tracking-tight mb-6'>
            Why HomeoPathway Exists?
          </h1>
          <p className="text-lg leading-relaxed max-w-4xl">
            Homeopathy can feel overwhelming because there are many remedies and detailed symptom patterns. HomeoPathway helps by organizing real user experiences, remedy insights, and community reported outcomes in one place, making it easier for people to learn from others and explore what has worked for different symptoms.
          </p>
        </div>

      </main>
    </div>
  )
}