import { NextResponse } from "next/server";
import { requireAdminFromCookies } from "@/lib/adminAuth";
import { deleteRow, getRow } from "@/lib/crud";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireAdminFromCookies();
  return NextResponse.json(await getRow("public.contact_messages", params.id));
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireAdminFromCookies();
  return NextResponse.json(await deleteRow("public.contact_messages", params.id));
}
