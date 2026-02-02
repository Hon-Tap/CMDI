export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import * as crud from "@/lib/crud";

const listRows = crud.listRows;
const insertRow = crud.insertRow;

// Optional if your lib exports them
const updateRow = (crud as any).updateRow as
  | undefined
  | ((table: string, id: number, patch: Record<string, any>) => Promise<any>);
const deleteRow = (crud as any).deleteRow as
  | undefined
  | ((table: string, id: number) => Promise<any>);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ status: "error", message }, { status });
}

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

async function requireAdminSafe() {
  try {
    await requireAdminFromCookies();
    return null;
  } catch (e: any) {
    if (e instanceof Response) return e;
    return jsonError("Unauthorized", 401);
  }
}

export async function GET(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  try {
    const { searchParams } = new URL(req.url);
    const page = toInt(searchParams.get("page"), 1);
    const pageSize = toInt(searchParams.get("pageSize"), 20);
    const q = (searchParams.get("q") || "").trim();

    const result = await listRows({
      table: "public.news",
      page,
      pageSize,
      orderBy: "id",
      orderDir: "desc",
      q,
      searchCols: ["title", "content"],
    });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[admin news GET] failed:", e);
    return jsonError("Failed to load news", 500);
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!title) return jsonError("Title is required", 400);
    if (!content) return jsonError("Content is required", 400);

    const row = await insertRow("public.news", { title, content });

    return NextResponse.json(row, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[admin news POST] failed:", e);
    return jsonError("Failed to create news", 500);
  }
}

export async function PATCH(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  if (!updateRow) return jsonError("PATCH not implemented (missing updateRow)", 501);

  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const id = Number(body.id);
    if (!Number.isFinite(id) || id <= 0) return jsonError("Valid id is required", 400);

    const patch: Record<string, any> = {};

    if ("title" in body) {
      const t = String(body.title ?? "").trim();
      if (!t) return jsonError("Title cannot be empty", 400);
      patch.title = t;
    }
    if ("content" in body) {
      const c = String(body.content ?? "").trim();
      if (!c) return jsonError("Content cannot be empty", 400);
      patch.content = c;
    }

    if (Object.keys(patch).length === 0) return jsonError("No fields to update", 400);

    const updated = await updateRow("public.news", id, patch);
    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[admin news PATCH] failed:", e);
    return jsonError("Failed to update news", 500);
  }
}

export async function DELETE(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  if (!deleteRow) return jsonError("DELETE not implemented (missing deleteRow)", 501);

  try {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));

    if (!Number.isFinite(id) || id <= 0) return jsonError("Valid id is required", 400);

    await deleteRow("public.news", id);
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[admin news DELETE] failed:", e);
    return jsonError("Failed to delete news", 500);
  }
}
