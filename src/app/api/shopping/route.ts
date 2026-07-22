import { NextRequest, NextResponse } from "next/server";
import { addShoppingItem, listShoppingItems } from "@/lib/data";
import { isStoreKey } from "@/lib/stores";

export async function GET() {
  const items = await listShoppingItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const store = body?.store;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const productLinkId = typeof body?.productLinkId === "string" ? body.productLinkId : null;

  if (typeof store !== "string" || !isStoreKey(store)) {
    return NextResponse.json({ error: "Tienda no válida." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Escribe el nombre del producto." }, { status: 400 });
  }

  const item = await addShoppingItem(store, name, productLinkId);
  return NextResponse.json({ item }, { status: 201 });
}
