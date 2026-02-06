export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import { insertRow, listRows } from "@/lib/crud";

export async function GET(req: Request) {
  await requireAdminFromCookies();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);
  const q = searchParams.get("q") || "";

  const result = await listRows({
    table: "public.featured_partner",
    page,
    pageSize,
    orderBy: "created_at",
    orderDir: "desc",
    q,
    searchCols: ["name", "description", "badge", "logo_src"],
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await requireAdminFromCookies();
  const body = await req.json();

  const payload = {
    name: body.name,
    description: body.description,
    clusters: Array.isArray(body.clusters) ? body.clusters : [],
    logo_src: body.logo_src,
    badge: body.badge,
  };

  const row = await insertRow("public.featured_partner", payload);
  return NextResponse.json(row);
}
