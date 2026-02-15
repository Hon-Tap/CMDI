// Frontend/app/layout.tsx

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Rendering behavior
 * (You had these already; keep if you intentionally want no caching)
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/* -----------------------------
   Site constants
----------------------------- */

const SITE_NAME = "CMDI";
const SITE_URL = "https://www.cmdi-ss.org"; // canonical host

const TAGLINE = "Supporting Children";

const DEFAULT_TITLE = `${SITE_NAME} | ${TAGLINE}`;

const DESCRIPTION =
  "Children’s Mission for Development Initiative (CMDI) is a child-focused NGO in South Sudan promoting education, protection, health, WASH, and community resilience.";

/**
 * Your logo exists here (from your screenshot):
 * Frontend/public/images/branding/CMDI_Logo.jpeg
 * We'll use it for OG/Twitter previews.
 */
const BRAND_LOGO = "/images/branding/CMDI_Logo.jpeg";

/**
 * Favicons are separate files. Put these in Frontend/public/:
 *  - favicon.ico
 *  - icon.png (512x512)
 *  - apple-touch-icon.png (180x180)
 */
const FAVICON_ICO = "/favicon.ico";
const ICON_PNG = "/icon.png";
const APPLE_TOUCH = "/apple-touch-icon.png";

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
        url: BRAND_LOGO,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${TAGLINE}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: [BRAND_LOGO],
  },

  /**
   * Browser tab / address-bar icon
   * (These files MUST exist in /public)
   */
  icons: {
    icon: [
      { url: FAVICON_ICO },
      { url: ICON_PNG, type: "image/png" },
    ],
    shortcut: [{ url: FAVICON_ICO }],
    apple: [{ url: APPLE_TOUCH }],
  },
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
