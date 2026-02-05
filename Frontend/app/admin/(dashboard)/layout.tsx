import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminShell from "./shell";

// FIX: Forces this layout (and all children) to be dynamic.
// This prevents Next.js from trying to build it statically, which fixes the hang.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CMDI Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}