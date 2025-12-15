import React from "react";

// Placeholder image paths
const IMAGE_REMEDIES = "/remedies.png";
const IMAGE_HAND = "/both-hand.png";

// Tailwind Constants based on Figma requirements (using best fit standard classes)

// 1. Body Text / Intro Text (Secondary, Medium, body-md)
// font-family: Fonts/secondary; font-weight: 500; font-size: Fonts/Copy/body-md/text size;
const BODY_TEXT = "font-montserrat text-[#41463B] text-base font-medium leading-7";

// 2. Sub-Headings (A historical foundation, etc.) (Secondary, SemiBold, body-lg)
// font-family: Fonts/secondary; font-weight: 600; font-size: Fonts/Copy/body-lg/text size;
const SUB_HEADING_STYLE = "font-montserrat text-xl font-semibold leading-7 text-[#0B0C0A]";

// 3. Main Title (What is Homeopathy? / Why HomeoPathway Exists?) (Primary, Regular, h3)
// font-family: Fonts/primary; font-weight: 400; font-size: Fonts/Headings/h3/text size;
const MAIN_TITLE_STYLE = "font-sans text-3xl md:text-4xl lg:text-[40px] font-normal text-[#0B0C0A]";


// Utility component for repeatable content sections
interface ContentBlockProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ title, children, className = '' }) => (
    <div className={className}>
        <h3 className={`${SUB_HEADING_STYLE} mb-3`}>
            {title}
        </h3>
        <p className={BODY_TEXT}>
            {children}
        </p>
    </div>
);


export default function HomeopathyPage() {
    return (
        <section className="bg-[#F5F1E8] py-10 md:py-16">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                <div className="bg-white rounded-[16px] border border-[#EDECE7] p-6 md:p-10 lg:p-12 shadow-md">

                    {/* PAGE TITLE - Uses MAIN_TITLE_STYLE (font-normal) */}
                    <h1 className={`${MAIN_TITLE_STYLE} mb-4`}>
                        What is Homeopathy?
                    </h1>

                    {/* INTRO - Uses BODY_TEXT and is border-bottomed */}
                    <p className={`${BODY_TEXT} border-b border-[#EDECE7] pb-6 mb-8 max-w-[900px]`}>
                        Homeopathy is a complementary system of medicine founded over 200 years ago
                        by the German physician Dr. Samuel Hahnemann. He observed that the body has
                        an inherent ability to heal itself and developed a therapeutic approach
                        based on how the body responds to certain substances.
                    </p>

                    {/* H2 - "Homeopathy is built on a few key ideas" - Uses SUB_HEADING_STYLE */}
                    <h2 className={`${SUB_HEADING_STYLE} mb-8`}>
                        Homeopathy is built on a few key ideas:
                    </h2>

                    {/* ===== SECTION 1: Text Blocks and Image 1 (Historical, Natural Sources, Image 1) ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 items-start">

                        {/* LEFT COLUMN: Historical and Natural Sources */}
                        <div className="space-y-10 lg:order-1 order-2">
                            
                            {/* A historical foundation - Uses ContentBlock */}
                            <ContentBlock title="A historical foundation">
                                In the late 1700s, Hahnemann noticed that taking certain substances
                                in large amounts produced specific symptoms. When these same
                                substances were given in extremely small, highly diluted forms,
                                many individuals reported relief from similar symptoms. This observation
                                became the guiding principle behind homeopathy.
                            </ContentBlock>

                            {/* Based on natural sources - Uses ContentBlock */}
                            <ContentBlock title="Based on natural sources">
                                Homeopathic remedies come from plant materials such as Arnica,
                                Belladonna, and Chamomilla, minerals like Natrum Muriaticum and
                                Sulphur, and various organic substances. These materials are prepared in a precise and structured way so they are gentle, accessible, and easy to use.
                            </ContentBlock>
                        </div>

                        {/* RIGHT COLUMN: Image 1 */}
                        <div className="lg:order-2 order-1">
                            <img
                                src={IMAGE_REMEDIES}
                                alt="Natural homeopathic remedies"
                                // Maintain aspect ratio similar to the source image
                                className="w-full h-auto rounded-[16px] object-cover shadow-lg"
                            />
                        </div>
                    </div>

                    {/* ===== SECTION 2: Potentization (Placed below Image 1 in flow, filling full width on mobile/single column on desktop) ===== */}
                    <div className="mt-10">
                        {/* Potentization - Uses ContentBlock */}
                        <ContentBlock title="Potentization">
                            Although remedies become highly diluted, homeopathic theory holds
                            that this process enhances the energetic properties of the original
                            substance, allowing the remedy to work effectively.
                        </ContentBlock>
                    </div>


                    {/* ===== SECTION 3: Image 2, Used worldwide, Non toxic and gentle (New two-column section) ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mt-12 items-start">

                        {/* LEFT COLUMN: Image 2 */}
                        <div>
                            <img
                                src={IMAGE_HAND}
                                alt="Homeopathic pills in hand"
                                className="w-full h-auto rounded-[16px] object-cover shadow-lg"
                            />
                        </div>

                        {/* RIGHT COLUMN: Used worldwide & Non toxic and gentle */}
                        <div className="space-y-10">
                            {/* Used worldwide - Uses ContentBlock */}
                            <ContentBlock title="Used worldwide">
                                Homeopathy is practiced in many parts of the world, including Europe,
                                South Asia, South America, and the United States. Some people use it for common everyday concerns, while others take a more classical approach and integrate it with conventional care.
                            </ContentBlock>

                            {/* Non toxic and gentle - Uses ContentBlock */}
                            <ContentBlock title="Non toxic and gentle">
                                Because remedies are highly diluted, they are typically safe for a
                                wide range of users, including children and older adults. However, individuals should use their own judgement and consult appropriate care when needed.
                            </ContentBlock>
                        </div>
                    </div>

                    {/* ===== FOOTER SECTION: Why HomeoPathway Exists? ===== */}
                    <div className="border-t border-[#EDECE7] mt-12 pt-10">
                        {/* Footer Title - Uses MAIN_TITLE_STYLE (font-normal) */}
                        <h2 className={`${MAIN_TITLE_STYLE} mb-4`}>
                            Why HomeoPathway Exists?
                        </h2>
                        {/* Footer Text - Uses BODY_TEXT */}
                        <p className={BODY_TEXT}>
                            Homeopathy can feel overwhelming because there are many remedies and
                            detailed symptom patterns. HomeoPathway helps by organizing real user
                            experiences, remedy insights, and community reported outcomes in one
                            place, making it easier for people to learn from others and explore what has worked for different symptoms.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}