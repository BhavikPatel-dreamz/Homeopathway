import React from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] ">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Terms of Service", isActive: true },
        ]}
      />

      <section className="bg-[#F5F1E8] pt-3 pb-[40px]">
        <div className="max-w-[1268px] mx-auto px-4">
          <div className="bg-white rounded-[8px] border-0 md:p-6 p-4">
            <div className="flex flex-col w-full">
              <h1 className="font-sans md:text-[40px] text-[36px] md:leading-[44px] leading-48px font-normal text-[#0B0C0A] mb-4">Terms of Service</h1>
              <p className="text-[#41463B] text-sm mb-4">Last Updated: February 24, 2026</p>

              <div className="text-[#41463B] text-[16px] leading-[24px] font-medium">
                <p className="mb-4">Welcome to HomeoPathway.com. These Terms of Service govern your use of the website.</p>
                <p className="mb-4">By accessing or using the site, you agree to these Terms. If you do not agree, please do not use the website.</p>

                <h3 className="font-semibold mt-6 mb-2">1. Purpose of the Platform</h3>
                <p className="mb-4">HomeoPathway is an informational platform that allows users to:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Explore homeopathic remedies</li>
                  <li>Share personal experiences with remedies</li>
                  <li>Rate and discuss remedies and ailments</li>
                  <li>Discover remedies through search and community contributions</li>
                </ul>
                <p className="mb-4">The website is intended to provide community experiences and informational content only.</p>

                <h3 className="font-semibold mt-6 mb-2">2. Medical Disclaimer</h3>
                <p className="mb-4">The content on HomeoPathway is not medical advice.</p>
                <p className="mb-4">Information on the site:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Is provided for informational purposes only</li>
                  <li>May include user-generated experiences or opinions</li>
                  <li>Is not intended to diagnose, treat, cure, or prevent any disease</li>
                </ul>
                <p className="mb-4">Always seek the advice of a qualified healthcare professional regarding medical conditions or treatment decisions.</p>
                <p className="mb-4">HomeoPathway does not verify or guarantee the safety, effectiveness, or accuracy of remedies discussed on the platform. You assume full responsibility for how you use any information found on the website.</p>

                <h3 className="font-semibold mt-6 mb-2">3. User Accounts</h3>
                <p className="mb-4">Some features of the website may require creating an account. By creating an account, you agree to:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Provide accurate information</li>
                  <li>Maintain the security of your login credentials</li>
                  <li>Be responsible for activity under your account</li>
                </ul>
                <p className="mb-4">We reserve the right to suspend or terminate accounts that violate these Terms.</p>

                <h3 className="font-semibold mt-6 mb-2">4. User-Generated Content</h3>
                <p className="mb-4">Users may submit content including remedy experiences, ratings and reviews, comments and feedback. By submitting content, you represent that:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>The content reflects your genuine experience or opinion</li>
                  <li>You have the right to share the content</li>
                  <li>The content does not violate laws or the rights of others</li>
                </ul>
                <p className="mb-4">You grant HomeoPathway a non-exclusive, worldwide, royalty-free license to display, distribute, and use the submitted content on the platform.</p>

                <h3 className="font-semibold mt-6 mb-2">5. Content Guidelines</h3>
                <p className="mb-4">Users agree not to submit content that:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Is intentionally false or misleading</li>
                  <li>Promotes unsafe or dangerous medical practices</li>
                  <li>Contains spam or promotional advertising</li>
                  <li>Harasses or abuses other users</li>
                  <li>Violates applicable laws</li>
                </ul>

                <h3 className="font-semibold mt-6 mb-2">6. Content Moderation</h3>
                <p className="mb-4">HomeoPathway may review, edit, or remove content that violates these Terms, contains harmful or misleading information, or is spam, abusive, or inappropriate. We reserve the right to moderate content at our discretion.</p>

                <h3 className="font-semibold mt-6 mb-2">7. Prohibited Activities</h3>
                <p className="mb-4">You agree not to:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Attempt to disrupt or damage the website</li>
                  <li>Use automated scraping tools without permission</li>
                  <li>Attempt unauthorized access to accounts or systems</li>
                  <li>Upload malware or malicious code</li>
                  <li>Use the website for unlawful purposes</li>
                </ul>

                <h3 className="font-semibold mt-6 mb-2">8. Intellectual Property</h3>
                <p className="mb-4">All website content, design, branding, and structure are owned by HomeoPathway, except for user-generated content. You may not copy, distribute, or reproduce site content without permission. Users retain ownership of their submitted content but grant the license described above.</p>

                <h3 className="font-semibold mt-6 mb-2">9. Limitation of Liability</h3>
                <p className="mb-4">HomeoPathway is provided “as is” and “as available.” We make no guarantees regarding accuracy of content, availability of the website, or effectiveness of remedies discussed. HomeoPathway will not be liable for health outcomes related to information on the site, user reliance on remedy discussions, errors or omissions in user-generated content, or temporary service interruptions. Your use of the website is at your own risk.</p>

                <h3 className="font-semibold mt-6 mb-2">10. Changes to These Terms</h3>
                <p className="mb-4">We may update these Terms periodically. The updated date will appear at the top of the page. Continued use of the website after updates means you accept the revised Terms.</p>

                <h3 className="font-semibold mt-6 mb-2">11. Contact</h3>
                <p className="mb-6">If you have questions about these Terms: Email: <a className="text-blue-600 underline" href="mailto:hello@homeopathway.com">hello@homeopathway.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
