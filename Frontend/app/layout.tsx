// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "../styles/globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: {
    default: "CMDI | Empowering Children & Communities",
    template: "%s | CMDI",
  },
  description:
    "Children’s Mission for Development Initiative (CMDI) is a child-focused NGO in South Sudan promoting education, protection, health, WASH, and community resilience.",
  applicationName: "CMDI",
  metadataBase: new URL("https://cmdi-ss.org"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "CMDI",
    title: "CMDI | Empowering Children & Communities",
    description:
      "A child-focused NGO in South Sudan promoting education, protection, health, WASH, and community resilience.",
    url: "https://cmdi-ss.org",
    images: [
      {
        url: "/images/branding/CMDI_Logo.jpeg",
        width: 1200,
        height: 630,
        alt: "CMDI — Empowering Children & Communities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CMDI | Empowering Children & Communities",
    description:
      "A child-focused NGO in South Sudan promoting education, protection, health, WASH, and community resilience.",
    images: ["/images/branding/CMDI_Logo.jpeg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00aeef",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip link (CSS-only; safe in Server Component) */}
        {/* <a href="#main" className="skipLink">
          Skip to content
        </a>
 */}
        <Navbar />

        <main id="main" style={{ minHeight: "70vh" }}>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
