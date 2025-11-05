import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"], // add or remove weights as needed
});

export const metadata: Metadata = {
  title: {
    default: "Homeopathway - Natural Homeopathic Remedies & Wellness Solutions",
    template: "%s | Homeopathway"
  },
  description: "Discover effective homeopathic remedies for common ailments. Browse our comprehensive database of natural treatments, read user reviews, and find the right homeopathic solution for your health needs.",
  keywords: [
    "homeopathy",
    "homeopathic remedies",
    "natural medicine",
    "alternative medicine",
    "wellness",
    "health solutions",
    "natural treatment",
    "holistic health",
    "homeopathic medicine",
    "natural healing"
  ],
  authors: [{ name: "Homeopathway Team" }],
  creator: "Homeopathway",
  publisher: "Homeopathway",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Homeopathway - Natural Homeopathic Remedies & Wellness Solutions",
    description: "Discover effective homeopathic remedies for common ailments. Browse our comprehensive database of natural treatments and find the right solution for your health needs.",
    siteName: "Homeopathway",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Homeopathway - Natural Homeopathic Remedies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homeopathway - Natural Homeopathic Remedies & Wellness Solutions",
    description: "Discover effective homeopathic remedies for common ailments. Browse our comprehensive database of natural treatments.",
    images: ["/og-image.jpg"],
    creator: "@homeopathway",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  console.log('Rendering RootLayout');
  return (
    
      
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
    
  );
}