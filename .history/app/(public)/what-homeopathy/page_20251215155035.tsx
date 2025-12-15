import React from 'react';

// Assume Breadcrumb component is implemented separately and takes 'items' prop
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

  // The Card style based on Figma/CSS:
  // background: var(--Surface-default-secondary, #FFFFFF);
  // border-radius: 24px;
  // padding: 24px (for mobile)
  // width: 1248px; height: 1180px; (full width on desktop up to a max-width, height auto)
  
  // The overall background: #F5F1E8
  
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: "Back to home", href: "/" },
          { label: "what is homeopathy?", isActive: true }
        ]}
      />
      
      {/* Header Section (based on the original code) */}
      <section className="px-4 py-16 md:py-20 lg:py-24 bg-[#f5f3ed] main-wrapper">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className='text-[30px] md:text-[32px] lg:text-[40px] font-semibold text-gray-900'>
            what is homeopathy?
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* The Homeopathy Card */}
        <div 
          className="bg-white p-6 md:p-8 lg:p-10 rounded-3xl shadow-lg"
          // Using a subtle shadow to make the card stand out from the background
          style={{ 
            borderRadius: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* What is Homeopathy? */}
          <section className="mb-10 border-b border-gray-200 pb-8">
            <h2 className='text-[28px] md:text-[30px] lg:text-[36px] font-bold mb-4 text-gray-900'>
              What is Homeopathy?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
              {homeopathyContent.what}
            </p>

            {/* Key Ideas - Two Column Layout for larger screens */}
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
              {/* Left Column Items */}
              <div className="space-y-8">
                {/* A historical foundation */}
                <div className="pr-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {homeopathyContent.keyIdeas[0].title}
                  </h3>
                  <p className="text-gray-600">
                    {homeopathyContent.keyIdeas[0].description}
                  </p>
                </div>
                
                {/* Based on natural sources */}
                <div className="pr-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {homeopathyContent.keyIdeas[1].title}
                  </h3>
                  <p className="text-gray-600">
                    {homeopathyContent.keyIdeas[1].description}
                  </p>
                </div>
                
                {/* Potentization */}
                <div className="pr-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {homeopathyContent.keyIdeas[2].title}
                  </h3>
                  <p className="text-gray-600">
                    {homeopathyContent.keyIdeas[2].description}
                  </p>
                </div>
              </div>
              
              {/* Right Column Items (for desktop layout) */}
              <div className="space-y-8 mt-8 md:mt-0">
                {/* Used worldwide */}
                <div className="pr-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {homeopathyContent.keyIdeas[3].title}
                  </h3>
                  <p className="text-gray-600">
                    {homeopathyContent.keyIdeas[3].description}
                  </p>
                </div>
                
                {/* Non toxic and gentle */}
                <div className="pr-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {homeopathyContent.keyIdeas[4].title}
                  </h3>
                  <p className="text-gray-600">
                    {homeopathyContent.keyIdeas[4].description}
                  </p>
                </div>
                
                {/* Placeholder for the user-provided image/URL */}
                <div className="mt-8">
                  {/* You would replace 'your-image-url-here.png' with the actual image URL */}
                  {/* The image is implicitly positioned in the layout of the original card. 
                      I am placing a placeholder here to account for its space on the right side. 
                      If the image is part of the content (like an illustration of a remedy), 
                      it needs to be placed contextually. */}
                  {/* <img src="your-image-url-here.png" alt="Homeopathy Illustration" className="w-full h-auto rounded-lg" /> */}
                </div>

              </div>
            </div>
          </section>

          {/* Why HomeoPathway Exists? */}
          <section>
            <h2 className='text-[28px] md:text-[30px] lg:text-[36px] font-bold mb-4 text-gray-900'>
              Why HomeoPathway Exists?
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {homeopathyContent.whyExists}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}