import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminShell from "./shell";

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
