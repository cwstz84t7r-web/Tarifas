import { NextRequest, NextResponse } from "next/server";
import { clearCheckedShoppingItems } from "@/lib/data";
import { isStoreKey } from "@/lib/stores";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const store = body?.store;
  if (store != null && !isStoreKey(store)) {
    return NextResponse.json({ error: "Tienda no válida." }, { status: 400 });
  }
  await clearCheckedShoppingItems(store);
  return NextResponse.json({ ok: true });
}
