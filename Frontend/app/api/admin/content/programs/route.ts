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
    table: "public.programs",
    page,
    pageSize,
    orderBy: "id",
    orderDir: "desc",
    q,
    searchCols: ["title", "description", "icon_name"],
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await requireAdminFromCookies();
  const body = await req.json();

  const payload = {
    title: body.title ?? null,
    description: body.description ?? null,
    icon_name: body.icon_name ?? null,
  };

  const row = await insertRow("public.programs", payload);
  return NextResponse.json(row);
}
