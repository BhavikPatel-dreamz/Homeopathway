import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
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


// ✅ Proper viewport setup for all devices
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Mobile app meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Homeopathway" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <link rel="mask-icon" href="/favicon.svg" color="#10b981" />
      </head>
      <body className="antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <meta name="theme-color" content="#10b981" />
//         <meta name="msapplication-TileColor" content="#10b981" />
//         <meta name="apple-mobile-web-app-capable" content="yes" />
//         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
//         <meta name="apple-mobile-web-app-title" content="Homeopathway" />
//          <meta
//           name="viewport"
//           content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
//         />
//         <link rel="icon" href="/favicon.ico" sizes="32x32" />
//         <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
//         <link rel="icon" href="/favicon-16x16.svg" type="image/svg+xml" sizes="16x16" />
//         <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
//         <link rel="mask-icon" href="/favicon.svg" color="#10b981" />
//       </head>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
//       > 
      
//           {children}
        
//       </body>
//     </html>
//   );
// }