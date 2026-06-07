import type { Metadata } from "next";
// @ts-ignore: side-effect import of CSS file
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CMDI | Supporting Children",
  description:
    "Children’s Mission For Development Initiative (CMDI) empowers vulnerable children and strengthens communities across South Sudan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <Navbar />

        <main id="main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}