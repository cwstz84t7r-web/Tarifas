import { NextRequest, NextResponse } from "next/server";
import { deleteShoppingItem, setShoppingItemChecked } from "@/lib/data";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.checked !== "boolean") {
    return NextResponse.json({ error: "Falta el estado 'checked'." }, { status: 400 });
  }
  await setShoppingItemChecked(id, body.checked);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteShoppingItem(id);
  return NextResponse.json({ ok: true });
}
