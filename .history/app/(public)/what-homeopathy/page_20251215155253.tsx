import React from 'react';

// --- Breadcrumb Component (Kept as-is, as requested) ---
const Breadcrumb = ({ items }) => {
  return (
    <nav className="text-sm font-medium text-gray-500 py-4 px-4 lg:px-8 max-w-7xl mx-auto">
      <ol className="list-none p-0 inline-flex space-x-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              <a 
                href={item.href || '#'} 
                className={`transition-colors duration-200 ${item.isActive ? 'text-gray-900 pointer-events-none' : 'hover:text-gray-700'}`}
              >
                {item.label}
              </a>
            </li>
            {index < items.length - 1 && (
              <li className="text-gray-400">/</li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};
// --- End Breadcrumb Component ---


export default function HomeopathyPage() {
  // Content taken directly from the Card.png image
  const homeopathyContent = {
    what: "Homeopathy is a complementary system of medicine founded over 200 years ago by the German physician Dr. Samuel Hahnemann. He observed that the body has an inherent ability to heal itself and developed a therapeutic approach based on how the body responds to certain substances.",
    keyIdeas: [
      {
        title: "A historical foundation",
        description: "In the late 1700s, Hahnemann noticed that taking certain substances in large amounts produced specific symptoms. When these same substances were given in extremely small, highly diluted forms, many individuals reported relief from similar symptoms. This observation became the guiding principle behind homeopathy.",
      },
      {
        title: "Based on natural sources",
        description: "Homeopathic remedies come from plant materials such as Arnica, Belladonna, and Chamomilla, minerals like Natrum Muriaticum and Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.",
      },
      {
        title: "Potentization",
        description: "Although remedies become highly diluted, homeopathic theory holds that this process enhances the energetic properties of the original substance, allowing the remedy to work effectively.",
      },
      {
        title: "Used worldwide",
        description: "Homeopathy is practiced in many parts of the world, including Europe, South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approachand integrate it with conventional care.",
      },
      {
        title: "Non toxic and gentle",
        description: "Because remedies are highly diluted, they are typically safe for a wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.",
      },
    ],
    whyExists: "Homeopathy can feel overwhelming because there are many remedies and detailed symptom patterns. HomeoPathway helps by organizing real user experiences, remedy insights, and community reported outcomes in one place, making it easier for people to learn from others and explore what has worked for different symptoms.",
  };

  // Placeholder for the image URL that will be provided by the user later
  const imageUrl = "your-provided-image-url-here.png"; 
  
  // Custom Tailwind utility classes to match the design's font sizes and colors
  const H1_STYLE = 'text-[30px] md:text-[32px] lg:text-[40px] font-semibold text-[#0B0C0A]';
  const H2_STYLE = 'text-[28px] md:text-[30px] lg:text-[36px] font-bold mb-4 text-[#0B0C0A]';
  const H3_STYLE = 'text-xl font-semibold mb-2 text-[#0B0C0A]';
  const P_LARGE_STYLE = 'text-gray-700 leading-relaxed text-lg';
  const P_SMALL_STYLE = 'text-gray-600';


  return (
    // Overall background color matching the original layout's background: #F5F1E8
    <div className="min-h-screen bg-[#F5F1E8]">
      
      {/* Breadcrumb - Use the provided component */}
      <Breadcrumb 
        items={[
          { label: "Back to home", href: "/" },
          { label: "what is homeopathy?", isActive: true }
        ]}
      />
      
      {/* Header Section */}
      {/* The original code had a separate header section, which is omitted for a tighter card-like structure, 
          as the image content starts directly on the main card's background. 
          If a separate header is required outside the card, uncomment and adjust the following: */}
      {/* <section className="px-4 py-16 md:py-20 lg:py-24 bg-[#f5f1e8]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={H1_STYLE}>
            what is homeopathy?
          </h1>
        </div>
      </section> */}


      {/* Main Content Area & The Homeopathy Card */}
      {/* Max width set to 1248px for the container to center the card on large screens */}
      <div className="max-w-[1248px] mx-auto px-4 py-8 md:py-12 lg:py-16">
        
        {/* The Homeopathy Card Container */}
        <div 
          className="bg-white rounded-3xl"
          // Figma Specs: padding: 24px; border-radius: 24px; width: 1248px (max-width used above)
          // The image shows padding around the text, let's use p-6 for mobile, p-10 for desktop (similar to 24px)
          style={{ 
            borderRadius: '24px', // Border Radius/200 = 24px
            // subtle shadow for definition
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="p-6 md:p-8 lg:p-10"> {/* Inner padding */}

            {/* What is Homeopathy? */}
            <section className="mb-10 border-b border-gray-200 pb-8">
              <h2 className={H2_STYLE}>
                What is Homeopathy?
              </h2>
              <p className={P_LARGE_STYLE}>
                {homeopathyContent.what}
              </p>
              
              <div className="pt-8">
                <h3 className="text-lg font-bold mb-4 text-[#0B0C0A]">
                  Homeopathy is built on a few key ideas:
                </h3>
              </div>


              {/* Key Ideas - Grid Layout */}
              {/* On desktop, this is a 2-column grid. The image appears in the second column. */}
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                
                {/* Left Column Items */}
                <div className="space-y-8">
                  
                  {/* A historical foundation */}
                  <div>
                    <h3 className={H3_STYLE}>
                      {homeopathyContent.keyIdeas[0].title}
                    </h3>
                    <p className={P_SMALL_STYLE}>
                      {homeopathyContent.keyIdeas[0].description}
                    </p>
                  </div>
                  
                  {/* Based on natural sources */}
                  <div>
                    <h3 className={H3_STYLE}>
                      {homeopathyContent.keyIdeas[1].title}
                    </h3>
                    <p className={P_SMALL_STYLE}>
                      {homeopathyContent.keyIdeas[1].description}
                    </p>
                  </div>
                  
                  {/* Potentization */}
                  <div>
                    <h3 className={H3_STYLE}>
                      {homeopathyContent.keyIdeas[2].title}
                    </h3>
                    <p className={P_SMALL_STYLE}>
                      {homeopathyContent.keyIdeas[2].description}
                    </p>
                    {/* Strategic image tag for Potentization, which is a complex concept */}
                    {/* The image is implicitly meant to fill the space next to the right-column text. */}
                  </div>
                </div>
                
                {/* Right Column Items + Image */}
                <div className="space-y-8 mt-8 md:mt-0">
                  
                  {/* Used worldwide */}
                  <div>
                    <h3 className={H3_STYLE}>
                      {homeopathyContent.keyIdeas[3].title}
                    </h3>
                    <p className={P_SMALL_STYLE}>
                      {homeopathyContent.keyIdeas[3].description}
                    </p>
                  </div>
                  
                  {/* Non toxic and gentle */}
                  <div>
                    <h3 className={H3_STYLE}>
                      {homeopathyContent.keyIdeas[4].title}
                    </h3>
                    <p className={P_SMALL_STYLE}>
                      {homeopathyContent.keyIdeas[4].description}
                    </p>
                  </div>
                  
                  {/* Placeholder for the user-provided image/URL 
                      This is positioned to occupy the lower-right space, as implied by the original card's layout. */}
                  <div className="mt-8">
                    {/* Replace 'imageUrl' with the actual URL when provided */}
                    <img 
                      src={imageUrl} 
                      alt="Illustration related to Homeopathy" 
                      className="w-full h-auto rounded-lg object-cover" 
                    />
                    {/* Triggering a diagram related to Potentization/Dilution, which is a key concept in the text. */}
                    {/*  */}
                  </div>

                </div>
              </div>
            </section>


            {/* Why HomeoPathway Exists? */}
            <section>
              <h2 className={H2_STYLE}>
                Why HomeoPathway Exists?
              </h2>
              <p className={P_LARGE_STYLE}>
                {homeopathyContent.whyExists}
              </p>
            </section>
            
          </div> {/* End inner padding */}

        </div> {/* End Card Container */}
      </div> {/* End Main Content Area */}
    </div>
  );
}