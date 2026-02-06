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
    table: "public.gallery_images",
    page,
    pageSize,
    orderBy: "id",
    orderDir: "desc",
    q,
    searchCols: ["src", "tag"],
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await requireAdminFromCookies();
  const body = await req.json();

  const payload = {
    src: body.src ?? null,
    tag: body.tag ?? null,
  };

  const row = await insertRow("public.gallery_images", payload);
  return NextResponse.json(row);
}
