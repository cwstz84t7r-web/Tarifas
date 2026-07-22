import { NextRequest, NextResponse } from "next/server";
import { addOrUpdateLink } from "@/lib/data";
import { isStoreKey } from "@/lib/stores";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const store = body?.store;
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (typeof store !== "string" || !isStoreKey(store)) {
    return NextResponse.json({ error: "Tienda no válida." }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "El enlace es obligatorio." }, { status: 400 });
  }

  await addOrUpdateLink(id, store, url);
  return NextResponse.json({ ok: true });
}
