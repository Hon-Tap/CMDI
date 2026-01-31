import { requireAdminFromCookies } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdminFromCookies();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div>{children}</div>
  );
}
