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
    table: "public.donation_tiers",
    page,
    pageSize,
    orderBy: "amount",
    orderDir: "asc",
    q,
    searchCols: ["impact", "desc"],
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await requireAdminFromCookies();
  const body = await req.json();

  const payload = {
    amount: Number(body.amount),
    impact: body.impact,
    desc: body.desc,
    featured: Boolean(body.featured),
  };

  const row = await insertRow("public.donation_tiers", payload);
  return NextResponse.json(row);
}
