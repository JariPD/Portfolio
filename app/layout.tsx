import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://jaridijk.nl";
const TITLE = "Jari Dijk — Developer";
const DESCRIPTION = "Portfolio of Jari Dijk, full-stack developer based in Den Haag.";

// Person structured data (schema.org) for richer search results. Static, trusted content
// only — JSON.stringify keeps it valid JSON; this is the documented Next.js JSON-LD pattern.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jari Dijk",
  jobTitle: "Full-Stack Developer",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Den Haag",
    addressCountry: "NL",
  },
  sameAs: [
    "https://github.com/JariPD",
    "https://www.linkedin.com/in/jari-dijk-59012a250/",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Jari Dijk",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Header />
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Without JS the reveal observer never runs, so make hidden sections visible. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
