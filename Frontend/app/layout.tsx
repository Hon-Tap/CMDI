// Frontend/app/layout.tsx

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Rendering behavior
 * Keep these only if you intentionally want no caching
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
 * Social preview (OpenGraph/Twitter)
 * Keep a proper 1200x630 image for best sharing previews
 */
const BRAND_LOGO_OG = "/images/branding/CMDI_Logo.jpeg";

/**
 * ICON FILES (put these in Frontend/public/)
 *
 * ✅ Minimum (recommended):
 *  - /favicon.ico                    (multi-size: 16/32/48 inside)
 *  - /icon-192.png                   (192x192)
 *  - /icon-512.png                   (512x512)
 *  - /apple-touch-icon.png           (180x180)
 *  - /site.webmanifest               (optional but best practice)
 *
 * Why multiple sizes?
 * Browsers + phones choose the best match for their UI. This is how you get
 * “bigger / sharper” icons in tabs, bookmarks, and home screens.
 */
const FAVICON_ICO = "/favicon.ico";
const ICON_192 = "/icon-192.png";
const ICON_512 = "/icon-512.png";
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
        url: BRAND_LOGO_OG,
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
    images: [BRAND_LOGO_OG],
  },

  /**
   * PWA / install support (optional but recommended)
   * If you create Frontend/public/site.webmanifest, Next will link it.
   */

  /**
   * Favicons / app icons
   * Browsers decide display size; we provide multiple sizes so the best one is chosen.
   */
  icons: {
    icon: [
      // Classic browsers: .ico (should include multiple internal sizes)
      { url: FAVICON_ICO, type: "image/x-icon" },

      // Modern PNG icons (higher-res = sharper)
      { url: ICON_192, type: "image/png", sizes: "192x192" },
      { url: ICON_512, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: APPLE_TOUCH, sizes: "180x180" }],
    shortcut: [{ url: FAVICON_ICO }],
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
