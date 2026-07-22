import { NextRequest, NextResponse } from "next/server";
import { createProduct } from "@/lib/data";
import { STORE_KEYS, isStoreKey } from "@/lib/stores";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "El nombre del producto es obligatorio." }, { status: 400 });
  }

  const links: { store: (typeof STORE_KEYS)[number]; url: string }[] = [];
  const rawLinks = body?.links ?? {};
  for (const store of STORE_KEYS) {
    const url = rawLinks[store];
    if (typeof url === "string" && url.trim()) {
      links.push({ store, url: url.trim() });
    }
  }

  for (const link of links) {
    if (!isStoreKey(link.store)) {
      return NextResponse.json({ error: "Tienda no válida." }, { status: 400 });
    }
  }

  const product = await createProduct(name, links);
  return NextResponse.json({ product }, { status: 201 });
}
