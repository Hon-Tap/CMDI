import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import { deleteRow, getRow, updateRow } from "@/lib/crud";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireAdminFromCookies();
  const row = await getRow("public.projects", params.id);
  return NextResponse.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireAdminFromCookies();
  const body = await req.json();

  const payload = {
    title: body.title ?? null,
    description: body.description ?? null,
    image_url: body.image_url ?? null,
    status: body.status ?? null,
    location: body.location ?? null,
    category: body.category ?? null,
    updated_at: new Date().toISOString(),
  };

  const row = await updateRow("public.projects", params.id, payload);
  return NextResponse.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireAdminFromCookies();
  return NextResponse.json(await deleteRow("public.projects", params.id));
}
