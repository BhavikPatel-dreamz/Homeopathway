import React from 'react';

// Assuming you have a Breadcrumb component setup like this:
const Breadcrumb = ({ items }) => {
  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="flex-shrink-0 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            )}
            {item.isActive ? (
              <span className="ml-2 font-medium text-gray-500 cursor-default">{item.label}</span>
            ) : (
              <a href={item.href} className="ml-2 font-medium text-gray-700 hover:text-gray-900">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Main component with the Homeopathy content
export default function HomeopathyPage() {
  return (
    // Outer container with the light beige background from the image
    <div className="min-h-screen bg-[#F5F1E8] font-sans">
      
      {/* Breadcrumb Section */}
      <Breadcrumb 
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" }, // Added 'About' for context based on the image text
          { label: "What is Homeopathy?", isActive: true }
        ]}
      />
      
      {/* Main Content Area */}
      <section className="px-4 py-8 lg:px-8 lg:py-12 bg-[#F5F1E8] main-wrapper">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Title Section - Styled to match the font and size in the image */}
          <div className="mb-8 p-4 bg-white rounded-lg shadow-md md:p-8 lg:p-10 border border-gray-200">
            <h1 className='text-[28px] md:text-[32px] lg:text-[40px] font-serif text-gray-800 mb-4'>
              What is Homeopathy?
            </h1>
            <p className="text-gray-600 leading-relaxed text-base">
              Homeopathy is a complementary system of medicine founded over 200 years ago by the German physician Dr. Samuel Hahnemann. He observed that the body has an inherent ability to heal itself and developed a therapeutic approach based on how the body responds to certain substances.
            </p>
            <p className="text-gray-600 leading-relaxed text-base mt-3">
              Homeopathy is built on a few key ideas:
            </p>
          </div>
          
          {/* Key Ideas Section - Using a grid/columns for the main content layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            
            {/* Left Column Content */}
            <div className="space-y-8">
              
              {/* Historical Foundation */}
              <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className='text-xl font-semibold text-gray-700 mb-3'>A historical foundation</h2>
                <p className="text-gray-600 leading-relaxed">
                  In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.
                </p>
              </div>
              
              {/* Based on natural sources */}
              <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className='text-xl font-semibold text-gray-700 mb-3'>Based on natural sources</h2>
                <p className="text-gray-600 leading-relaxed">
                  Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
                </p>
              </div>

              {/* Potentization */}
              <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className='text-xl font-semibold text-gray-700 mb-3'>Potentization</h2>
                <p className="text-gray-600 leading-relaxed">
                  Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively.
                </p>
              </div>

              {/* Image 2 Placeholder (Hand holding bottle) - Placed below left-column text for smaller screens, will naturally flow to the left column in the grid */}
              <div className="md:hidden lg:block">
                <img 
                  src="[Your second image URL here for hand holding bottle]" 
                  alt="A hand holding a small bottle of homeopathic pills" 
                  className="w-full h-auto rounded-lg object-cover shadow-lg"
                />
              </div>

            </div>

            {/* Right Column Content */}
            <div className="space-y-8">

              {/* Image 1 Placeholder (Herbs and Tea) - Placed at the top of the right column as in the image */}
              <div>
                <img 
                  src="[Your first image URL here for herbs and tea]" 
                  alt="Herbal ingredients and a cup of tea, representing natural remedies" 
                  className="w-full h-auto rounded-lg object-cover shadow-lg"
                />
              </div>

              {/* Used Worldwide */}
              <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className='text-xl font-semibold text-gray-700 mb-3'>Used worldwide</h2>
                <p className="text-gray-600 leading-relaxed">
                  Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approach and integrate it with conventional care.
                </p>
              </div>
              
              {/* Non toxic and gentle */}
              <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h2 className='text-xl font-semibold text-gray-700 mb-3'>Non toxic and gentle</h2>
                <p className="text-gray-600 leading-relaxed">
                  Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                </p>
              </div>

              {/* Image 2 Placeholder for MD screens - This will only show on medium/tablet screens, hidden on large screens and above */}
              <div className="hidden md:block lg:hidden">
                <img 
                  src="[Your second image URL here for hand holding bottle]" 
                  alt="A hand holding a small bottle of homeopathic pills" 
                  className="w-full h-auto rounded-lg object-cover shadow-lg"
                />
              </div>

            </div>

            {/* Why HomeoPathway Exists? - Full width section at the bottom */}
            <div className="md:col-span-2 pt-8">
                <h2 className='text-[28px] md:text-[32px] font-serif text-gray-800 mb-4'>
                    Why HomeoPathway Exists?
                </h2>
                <div className='p-4 bg-white rounded-lg shadow-md border border-gray-200'>
                    <p className="text-gray-600 leading-relaxed">
                      Homeopathy can feel overwhelming because there are many remedies and detailed symptom patterns. HomeoPathway helps by organizing real user experiences, remedy insights, and community reported outcomes in one place, making it easier for people to learn from others and explore what has worked for different symptoms.
                    </p>
                </div>
            </div>

          </div>

          {/* Footer content from the image, styled as a minimal bar */}
          <div className="mt-12 text-center text-sm text-gray-500">
              <span className="inline-block py-1 px-3 bg-white rounded-full border border-gray-300 mr-2">1248 Fill</span>
              <span className="inline-block py-1 px-3 bg-white rounded-full border border-gray-300">1180 Hung</span>
          </div>

        </div>
      </section>
    </div>
  )
}