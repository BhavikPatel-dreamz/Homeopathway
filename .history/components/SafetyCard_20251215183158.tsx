import React from 'react';

// Utility component for the checklist items in "Safety Considerations"
const SafetyChecklistItem = ({ children }) => (
  <div className="flex items-start mb-3 text-gray-700">
    {/* Custom checkmark icon (can be replaced with an SVG icon if needed) */}
    <span className="text-green-600 text-xl font-bold mr-2 leading-none">✓</span>
    <p className="text-base leading-relaxed flex-1">
      {children}
    </p>
  </div>
);

const SafetyContent = () => {
  return (
    <div className="bg-white p-6 shadow-lg rounded-lg max-w-7xl mx-auto my-8 border border-gray-200">
      
      {/* Safety and Research Header and Introduction */}
      <h1 className="text-3xl font-serif text-gray-800 mb-4 border-b pb-2">
        Safety and Research
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Homeopathic remedies are generally considered safe because of their high dilutions, but it is still important to use them responsibly.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Image and Context */}
        <div className="lg:w-1/2">
          {/* Placeholder for the image */}
          <div className="w-full h-auto mb-6">
            {/* The image should be imported and used here. For simplicity, I'm using an img tag with alt text. */}
            <img 
              src="/path/to/your/Card_1.jpg" // **Update this path to your actual image location**
              alt="A person preparing homeopathic remedies with small dropper bottles and a scale."
              className="w-full h-auto object-cover rounded-lg"
              style={{ maxHeight: '350px' }} // Optional style to control height
            />
          </div>
        </div>

        {/* Right Column: Safety Considerations */}
        <div className="lg:w-1/2">
          <div className="bg-[#f9f9f9] p-6 rounded-lg border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Safety Considerations
            </h2>
            
            <SafetyChecklistItem>
              Remedies are usually non toxic and have minimal risk of interactions.
            </SafetyChecklistItem>
            
            <SafetyChecklistItem>
              They should not be used as a replacement for emergency or life saving medical care.
            </SafetyChecklistItem>
            
            <SafetyChecklistItem>
              Children, pregnant individuals, or anyone with chronic conditions should consult a healthcare professional before trying a new remedy.
            </SafetyChecklistItem>
            
            <SafetyChecklistItem>
              If symptoms worsen or do not improve, a qualified medical provider should be consulted.
            </SafetyChecklistItem>
          </div>
        </div>
      </div>
      
      {/* --- Horizontal Rule for separation (if desired, not explicitly in the source image but helps structure) --- */}
      <hr className="my-10 border-t border-gray-200" />


      {/* Important Disclaimer Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Important Disclaimer:
        </h2>
        
        <p className="text-base text-gray-700 mb-4 leading-relaxed">
          HomeoPathway is an informational platform that provides community submitted experiences, remedy comparisons, and general reference material about homeopathy. The content on this site is not medical advice, diagnosis, or treatment. Nothing on HomeoPathway should be used as a substitute for professional medical care.
        </p>

        <p className="text-base text-gray-700 mb-4 leading-relaxed">
          Homeopathy can be helpful for everyday, non emergency situations, but it should not replace conventional medical evaluation when needed. If you are experiencing severe, new, worsening, or concerning symptoms, you should seek immediate medical attention from a licensed healthcare professional. If you have a chronic health condition, are pregnant, breastfeeding, or are giving remedies to children, consult a qualified professional before using any homeopathic product.
        </p>

        <p className="text-base text-gray-700 mb-4 leading-relaxed">
          Some individuals report positive outcomes, while others may not experience changes. Individual results cannot be predicted, and the information on this website should be interpreted with caution. HomeoPathway does not endorse any specific remedy, potency, brand, or protocol.
        </p>

        <p className="text-sm text-gray-600 italic leading-relaxed pt-2 border-t mt-6">
          By using HomeoPathway, you acknowledge that you are responsible for your own health decisions and that any actions you take based on the information here are at your own discretion and risk. If you are unsure about any health related concern, always seek guidance from a licensed healthcare provider.
        </p>
      </div>

    </div>
  );
};

export default SafetyContent;