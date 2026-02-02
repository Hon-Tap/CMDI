export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import * as crud from "@/lib/crud";

/**
 * We only hard-rely on listRows + insertRow (you already have these).
 * updateRow/deleteRow are optional — if your crud lib exports them, PATCH/DELETE works.
 */
const listRows = crud.listRows;
const insertRow = crud.insertRow;
const updateRow = (crud as any).updateRow as
  | undefined
  | ((table: string, id: number, patch: Record<string, any>) => Promise<any>);
const deleteRow = (crud as any).deleteRow as
  | undefined
  | ((table: string, id: number) => Promise<any>);

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json(
    { status: "error", message, ...(extra ? { extra } : {}) },
    { status }
  );
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
    // In case your helper throws a Response/NextResponse
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
      table: "public.programs",
      page,
      pageSize,
      orderBy: "id",
      orderDir: "desc",
      q,
      searchCols: ["title", "description", "icon_name"],
    });

    // Ensure no caching surprises in admin views
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    console.error("[admin programs GET] failed:", e);
    return jsonError("Failed to load programs", 500);
  }
}

export async function POST(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const title = String(body.title ?? "").trim();
    const description =
      body.description === undefined || body.description === null
        ? null
        : String(body.description).trim();
    const icon_name =
      body.icon_name === undefined || body.icon_name === null
        ? null
        : String(body.icon_name).trim();

    if (!title) return jsonError("Title is required", 400);

    const payload = { title, description, icon_name };

    const row = await insertRow("public.programs", payload);

    return NextResponse.json(row, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    console.error("[admin programs POST] failed:", e);
    return jsonError("Failed to create program", 500);
  }
}

/**
 * Optional: enable editing if your crud exports updateRow
 * Body: { id, title?, description?, icon_name? }
 */
export async function PATCH(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  if (!updateRow) {
    return jsonError(
      "PATCH not implemented (missing updateRow in lib/crud)",
      501
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const idRaw = body.id;
    const id = typeof idRaw === "string" ? Number(idRaw) : Number(idRaw);
    if (!Number.isFinite(id) || id <= 0) return jsonError("Valid id is required", 400);

    const patch: Record<string, any> = {};

    if ("title" in body) {
      const t = String(body.title ?? "").trim();
      if (!t) return jsonError("Title cannot be empty", 400);
      patch.title = t;
    }
    if ("description" in body) {
      patch.description =
        body.description === undefined || body.description === null
          ? null
          : String(body.description).trim();
    }
    if ("icon_name" in body) {
      patch.icon_name =
        body.icon_name === undefined || body.icon_name === null
          ? null
          : String(body.icon_name).trim();
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const updated = await updateRow("public.programs", id, patch);
    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    console.error("[admin programs PATCH] failed:", e);
    return jsonError("Failed to update program", 500);
  }
}

/**
 * Optional: enable delete if your crud exports deleteRow
 * Accepts: ?id=123 OR JSON { id: 123 }
 */
export async function DELETE(req: Request) {
  const authErr = await requireAdminSafe();
  if (authErr) return authErr as any;

  if (!deleteRow) {
    return jsonError(
      "DELETE not implemented (missing deleteRow in lib/crud)",
      501
    );
  }

  try {
    const url = new URL(req.url);
    const idQ = url.searchParams.get("id");

    let id = idQ ? Number(idQ) : NaN;
    if (!idQ) {
      const body = await req.json().catch(() => null);
      if (body?.id !== undefined) id = Number(body.id);
    }

    if (!Number.isFinite(id) || id <= 0) return jsonError("Valid id is required", 400);

    await deleteRow("public.programs", id);
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[admin programs DELETE] failed:", e);
    return jsonError("Failed to delete program", 500);
  }
}
