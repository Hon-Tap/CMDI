// Frontend/app/layout.tsx

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* -----------------------------
   Site constants
----------------------------- */

const SITE_NAME = "CMDI";
const SITE_URL = "https://www.cmdi-ss.org"; // ✅ canonical host should be www
const DEFAULT_TITLE = "CMDI | Empowering Children & Communities";
const DESCRIPTION =
  "Children’s Mission for Development Initiative (CMDI) is a child-focused NGO in South Sudan promoting education, protection, health, WASH, and community resilience.";

const OG_IMAGE = "/images/branding/CMDI_Logo.jpeg";

/* -----------------------------
   Metadata (SEO)
----------------------------- */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,

  alternates: {
    canonical: "/", // resolved against metadataBase
  },

  robots: {
    index: true,
    follow: true,
    // helps Google show big image preview in SERP
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Empowering Children & Communities`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },

  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  // Add once you have these. Safe to keep commented until ready.
  // verification: {
  //   google: "GOOGLE_SEARCH_CONSOLE_TOKEN",
  //   other: {
  //     "msvalidate.01": "BING_TOKEN",
  //   },
  // },

  // Optional: if you have a public contact email later
  // authors: [{ name: SITE_NAME, url: SITE_URL }],
};

/* -----------------------------
   Viewport
----------------------------- */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00aeef",
  colorScheme: "light",
};

/* -----------------------------
   Layout
----------------------------- */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="appBody">
        {/* Accessible skip link */}
        <a href="#main" className="skipLink">
          Skip to content
        </a>

        <Navbar />

        <main id="main" className="appMain" role="main" tabIndex={-1}>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
