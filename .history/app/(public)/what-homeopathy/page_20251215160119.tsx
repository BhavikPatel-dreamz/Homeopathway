import React from 'react';
import Breadcrumb from '../../../'; // Assuming Breadcrumb component is in the same directory or available path

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
  // The user should replace this with the actual URL for the visual element shown in the screenshot.
  const imageUrl = "your-provided-image-url-here.png"; 
  
  // Custom Tailwind utility classes to match the design's font sizes and colors from the image
  const COLOR_PRIMARY = '#0B0C0A'; // Dark text
  const COLOR_SECONDARY = '#41463B'; // Grayish text for descriptions
  const COLOR_BACKGROUND = '#F5F1E8'; // Off-white background
  
  const H1_STYLE = `text-[30px] md:text-[32px] lg:text-[40px] font-semibold text-[${COLOR_PRIMARY}]`;
  const H2_STYLE = `text-[28px] md:text-[30px] lg:text-[36px] font-bold mb-4 text-[${COLOR_PRIMARY}]`;
  const H3_STYLE = `text-xl font-semibold mb-2 text-[${COLOR_PRIMARY}]`;
  const P_LARGE_STYLE = `text-[18px] text-[${COLOR_PRIMARY}] leading-relaxed`;
  const P_SMALL_STYLE = `text-[16px] text-[${COLOR_SECONDARY}] leading-relaxed`;


  return (
    // Overall background color matching the original layout's background: #F5F1E8
    <div className="min-h-screen" style={{ backgroundColor: COLOR_BACKGROUND }}>
      
      {/* Breadcrumb - Use the provided component */}
      <Breadcrumb 
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "What is Homeopathy?", isActive: true }
        ]}
      />
      
      {/* Main Content Area & The Homeopathy Card */}
      {/* Max width set to 1248px for the card container to center the card on large screens */}
      <div className="max-w-[1248px] mx-auto px-4 py-8 md:py-12 lg:py-16">
        
        {/* The Homeopathy Card Container */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '24px', // Border Radius/200 = 24px
            // subtle shadow for definition, if needed (not visible in image, but good practice)
            boxShadow: '0 4px 12px -1px rgba(0, 0, 0, 0.03)' 
          }}
        >
          <div className="p-6 md:p-10 lg:p-12"> {/* Inner padding matching the original design's 24px/40px equivalent */}

            {/* What is Homeopathy? Section */}
            <section className="mb-10 border-b border-gray-200 pb-8">
              <h2 className={H2_STYLE}>
                What is Homeopathy?
              </h2>
              <p className={P_LARGE_STYLE}>
                {homeopathyContent.what}
              </p>
              
              <div className="pt-8">
                <h3 className={`text-[16px] font-bold mb-6 text-[${COLOR_PRIMARY}]`}>
                  Homeopathy is built on a few key ideas:
                </h3>
              </div>


              {/* Key Ideas - Grid Layout */}
              {/* On desktop, this is a 2-column grid with a substantial gap. */}
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                
                {/* Left Column Items */}
                <div className="space-y-12">
                  
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
                  
                  {/* Potentization (Complex concept needs visual aid) */}
                  <div>
                    <h3 className={H3_STYLE}>
                      {homeopathyContent.keyIdeas[2].title}
                    </h3>
                    <p className={P_SMALL_STYLE}>
                      {homeopathyContent.keyIdeas[2].description}
                    </p>
                    {/* Visual aid for the complex process of high dilution and potentization */}
                    <div className='mt-4'>
                                            </div>
                  </div>
                </div>
                
                {/* Right Column Items + Image */}
                <div className="space-y-12 mt-4 md:mt-0">
                  
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
                      This occupies the bottom-right space as shown in the original card's layout. */}
                  <div className="mt-8">
                    {/* Replace 'imageUrl' with the actual URL when provided */}
                    <img 
                      src={imageUrl} 
                      alt="Homeopathic remedies being dispensed by hand" 
                      className="w-full h-auto rounded-xl object-cover" 
                      style={{ borderRadius: '12px' }} // Slightly less rounded than the card
                    />
                  </div>

                </div>
              </div>
            </section>


            {/* Why HomeoPathway Exists? Section */}
            <section>
              <h2 className={H2_STYLE} style={{ marginBottom: '16px' }}>
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