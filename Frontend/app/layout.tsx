// Frontend/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SITE_NAME = "CMDI";
const SITE_URL = "https://cmdi-ss.org";
const DEFAULT_TITLE = "CMDI | Empowering Children & Communities";
const DESCRIPTION =
  "Children’s Mission for Development Initiative (CMDI) is a child-focused NGO in South Sudan promoting education, protection, health, WASH, and community resilience.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },

  description: DESCRIPTION,
  applicationName: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/images/branding/CMDI_Logo.jpeg",
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
    images: ["/images/branding/CMDI_Logo.jpeg"],
  },

  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00aeef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="appBody">
        {/* Accessible skip link */}
        <a href="#main" className="skipLink">
          Skip to content
        </a>

        <Navbar />

        <main id="main" className="appMain" role="main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
