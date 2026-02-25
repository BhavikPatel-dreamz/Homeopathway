import React from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] ">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", isActive: true },
        ]}
      />

      <section className="bg-[#F5F1E8] pt-3 pb-[40px]">
        <div className="max-w-[1268px] mx-auto px-4">
          <div className="bg-white rounded-[8px] border-0 md:p-6 p-4">
            <div className="flex flex-col w-full">
              <h1 className="font-sans md:text-[40px] text-[36px] md:leading-[44px] leading-48px font-normal text-[#0B0C0A] mb-4">Privacy Policy</h1>
              <p className="text-[#41463B] text-sm mb-4">Last Updated: February 24, 2026</p>

              <div className="text-[#41463B] text-[16px] leading-[24px] font-medium">
                <p className="mb-4">Welcome to HomeoPathway.com. This Privacy Policy explains how we collect, use, and protect your information when you use our website.</p>

                <p className="mb-4">By using HomeoPathway, you agree to the collection and use of information in accordance with this policy.</p>

                <h3 className="font-semibold mt-6 mb-2">1. Information We Collect</h3>

                <h4 className="font-semibold">Information You Provide</h4>
                <p className="mb-3">You may voluntarily provide information such as:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Name or username</li>
                  <li>Email address</li>
                  <li>Reviews or experiences with remedies</li>
                  <li>Ratings or comments</li>
                  <li>Messages sent through contact forms</li>
                </ul>
                <p className="mb-4">This information may be visible publicly if you submit reviews or comments.</p>

                <h4 className="font-semibold">Automatically Collected Information</h4>
                <p className="mb-3">When you visit the website, certain information may be collected automatically, including:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Device type</li>
                  <li>Pages visited</li>
                  <li>Time spent on the website</li>
                  <li>Referral sources</li>
                </ul>
                <p className="mb-4">This information helps us understand how users interact with the platform and improve the website.</p>

                <h4 className="font-semibold">Cookies and Similar Technologies</h4>
                <p className="mb-4">HomeoPathway may use cookies or similar technologies to:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Improve website functionality</li>
                  <li>Remember user preferences</li>
                  <li>Analyze traffic patterns</li>
                  <li>Maintain login sessions</li>
                </ul>
                <p className="mb-6">You may disable cookies through your browser settings, though some features of the website may not function properly.</p>

                <h3 className="font-semibold mt-6 mb-2">2. How We Use Your Information</h3>
                <p className="mb-4">We use collected information to:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Operate and maintain the website</li>
                  <li>Improve search, ranking, and discovery of remedies and ailments</li>
                  <li>Display user-generated reviews and experiences</li>
                  <li>Respond to user inquiries</li>
                  <li>Monitor site performance and security</li>
                  <li>Prevent spam, abuse, and fraudulent activity</li>
                </ul>
                <p className="mb-6">We do not sell personal information to third parties.</p>

                <h3 className="font-semibold mt-6 mb-2">3. User-Generated Content</h3>
                <p className="mb-4">If you submit experiences, ratings, or comments, that content may be publicly displayed on the website. Please avoid sharing sensitive personal or medical information about yourself or others.</p>

                <h3 className="font-semibold mt-6 mb-2">4. Third-Party Services</h3>
                <p className="mb-4">We may use third-party services to support the website, including hosting, analytics, and email tools. These providers may process limited information necessary to perform their services but are not permitted to use your information for unrelated purposes.</p>

                <h3 className="font-semibold mt-6 mb-2">5. Data Security</h3>
                <p className="mb-4">We take reasonable administrative and technical measures to protect your information. However, no internet transmission or storage system can be guaranteed to be completely secure.</p>

                <h3 className="font-semibold mt-6 mb-2">6. Children&apos;s Privacy</h3>
                <p className="mb-4">HomeoPathway is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If such information is discovered, we will take steps to remove it.</p>

                <h3 className="font-semibold mt-6 mb-2">7. Your Rights</h3>
                <p className="mb-4">You may request to access, correct, or delete information we have about you. Requests can be sent to: <a className="text-blue-600 underline" href="mailto:hello@homeopathway.com">hello@homeopathway.com</a></p>

                <h3 className="font-semibold mt-6 mb-2">8. Changes to This Policy</h3>
                <p className="mb-4">We may update this Privacy Policy periodically. When changes are made, the updated date will be listed at the top of this page. Continued use of the website after changes means you accept the revised policy.</p>

                <h3 className="font-semibold mt-6 mb-2">9. Contact</h3>
                <p className="mb-10">For questions about this Privacy Policy: Email: <a className="text-blue-600 underline" href="mailto:hello@homeopathway.com">hello@homeopathway.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
