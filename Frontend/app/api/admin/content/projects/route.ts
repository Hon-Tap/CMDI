import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import { insertRow, listRows } from "@/lib/crud";

export const dynamic = "force-dynamic";

function clampInt(v: string | null, def: number, min: number, max: number) {
  const n = Number.parseInt(v ?? "", 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: Request) {
  await requireAdminFromCookies();

  const url = new URL(req.url);
  const page = clampInt(url.searchParams.get("page"), 1, 1, 10_000);
  const pageSize = clampInt(url.searchParams.get("pageSize"), 20, 5, 200);
  const q = url.searchParams.get("q")?.trim() || undefined;

  const result = await listRows({
    table: "public.projects",
    page,
    pageSize,
    orderBy: "id",
    orderDir: "desc",
    q,
    searchCols: ["title", "description", "location", "category", "status"],
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await requireAdminFromCookies();

  const body = await req.json().catch(() => ({}));

  const now = new Date().toISOString();
  const payload = {
    title: body.title ?? null,
    description: body.description ?? null,
    image_url: body.image_url ?? null,
    status: body.status ?? "draft",
    location: body.location ?? null,
    category: body.category ?? null,
    created_at: now,
    updated_at: now,
  };

  const row = await insertRow("public.projects", payload);
  return NextResponse.json(row);
}
