import { NextRequest, NextResponse } from "next/server";
import { getLink, recordSuccess } from "@/lib/data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const link = await getLink(id);
  if (!link) {
    return NextResponse.json({ error: "Enlace no encontrado." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const price = Number(body?.price);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Precio no válido." }, { status: 400 });
  }

  await recordSuccess(id, price, "EUR", "manual");
  return NextResponse.json({ ok: true, price });
}
