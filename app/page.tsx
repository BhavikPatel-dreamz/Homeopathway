import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePageContent from '@/components/HomePageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home - Find Natural Homeopathic Remedies for Common Ailments",
  description: "Explore our comprehensive database of homeopathic remedies for headaches, anxiety, insomnia, cold & flu, allergies, and more. Read user reviews and find effective natural treatments.",
  keywords: [
    "homeopathic remedies",
    "natural treatment",
    "headache remedy",
    "anxiety treatment",
    "insomnia cure",
    "cold flu remedy",
    "allergy treatment",
    "joint pain relief",
    "digestive health",
    "muscle soreness treatment"
  ],
  openGraph: {
    title: "Homeopathway - Find Natural Homeopathic Remedies",
    description: "Discover effective homeopathic treatments for common ailments. Browse remedies, read reviews, and find natural solutions for your health needs.",
    url: "/",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Homeopathway Homepage - Natural Remedies Database",
      },
    ],
  },
};

const dummyAilments = [
  { id: "d1", name: "Headache", slug: "headache", icon: "😣", remedies_count: 45 },
  { id: "d2", name: "Anxiety", slug: "anxiety", icon: "😰", remedies_count: 38 },
  { id: "d3", name: "Insomnia", slug: "insomnia", icon: "😴", remedies_count: 42 },
  { id: "d4", name: "Cold & Flu", slug: "cold-and-flu", icon: "🤧", remedies_count: 52 },
  { id: "d5", name: "Allergies", slug: "allergies", icon: "🤧", remedies_count: 47 },
  { id: "d6", name: "Joint Pain", slug: "joint-pain", icon: "🦴", remedies_count: 35 },
  { id: "d7", name: "Digestion", slug: "digestion", icon: "💊", remedies_count: 41 },
  { id: "d8", name: "Cough", slug: "cough", icon: "😷", remedies_count: 44 },
  { id: "d9", name: "Muscle Soreness", slug: "muscle-soreness", icon: "💪", remedies_count: 29 },
  { id: "d10", name: "Nasal polyps", slug: "nasal-polyps", icon: "👃", remedies_count: 18 },
  { id: "d11", name: "Sunburn", slug: "sunburn", icon: "☀️", remedies_count: 22 },
  { id: "d12", name: "Back pain", slug: "back-pain", icon: "🧍", remedies_count: 33 },
  { id: "d13", name: "High blood pressure", slug: "high-blood-pressure", icon: "🩸", remedies_count: 31 },
  { id: "d14", name: "Urinary tract infection", slug: "urinary-tract-infection", icon: "💧", remedies_count: 26 },
  { id: "d15", name: "Kidney stones", slug: "kidney-stones", icon: "🪨", remedies_count: 19 },
  { id: "d16", name: "Cuts, bruises, and burns", slug: "cuts-bruises-and-burns", icon: "🔥", remedies_count: 28 },
  { id: "d17", name: "Swelling", slug: "swelling", icon: "🟡", remedies_count: 24 },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: ailmentsData, error: ailmentsError } = await supabase
    .from("ailments")
    .select("id, name, slug, icon, remedies_count")
    .order("name", { ascending: true });

  if (ailmentsError) {
    console.error("Error fetching ailments:", ailmentsError);
  }

  const ailments = ailmentsData && ailmentsData.length > 0 ? ailmentsData : dummyAilments;

  const dummyTopRemedies = [
    { 
      name: "Nux Vomica", 
      average_rating: 5, 
      review_count: 234,
      description: "Best for nausea and acidity, especially after..."
    },
    { 
      name: "Belladonna", 
      average_rating: 5, 
      review_count: 324,
      description: "Best for sudden, intense, throbbing pain that..."
    },
    { 
      name: "Bryonia Alba", 
      average_rating: 5, 
      review_count: 324,
      description: "Best for dry coughs that worsen with movement."
    },
    { 
      name: "Coffea Cruda", 
      average_rating: 5, 
      review_count: 143,
      description: "Best for sleeplessness due to an overactive..."
    },
    { 
      name: "Gelsemium Sempervirens", 
      average_rating: 4, 
      review_count: 247,
      description: "Best for flu-like symptoms with weakness, achi..."
    },
  ];

  const { data: remediesData, error: remediesError } = await supabase
    .from("remedies")
    .select("name, average_rating, review_count, description,slug,icon")
    .order("average_rating", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(5);

  if (remediesError) {
    console.error("Error fetching top remedies:", remediesError);
  }

  const topRemedies = remediesData && remediesData.length > 0 ? remediesData : dummyTopRemedies;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Homeopathway",
    "description": "Comprehensive database of homeopathic remedies and natural treatments",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Homeopathway",
      "description": "Leading platform for homeopathic remedies and natural health solutions"
    }
  };
  

  return (
    <>
    <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{
             __html: JSON.stringify(structuredData),
           }}
         />
      <HomePageContent initialAilments={ailments} initialTopRemedies={topRemedies} />
     </>
  );
}
