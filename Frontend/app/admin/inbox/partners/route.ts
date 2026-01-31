import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import { listRows } from "@/lib/crud";

export async function GET(req: Request) {
  await requireAdminFromCookies();
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);
  const q = searchParams.get("q") || "";

  const result = await listRows({
    table: "public.partner_requests",
    page,
    pageSize,
    orderBy: "created_at",
    orderDir: "desc",
    q,
    searchCols: ["organization_name", "organization_type", "contact_name", "email", "country", "partnership_interest"],
  });

  return NextResponse.json(result);
}
