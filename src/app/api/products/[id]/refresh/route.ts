import { NextRequest, NextResponse } from "next/server";
import { getProductWithLinks, recordFailure, recordSuccess } from "@/lib/data";
import { scrapePrice } from "@/lib/scrapers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductWithLinks(id);
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  const results = [];
  for (const link of product.links) {
    const result = await scrapePrice(link.store, link.url);
    if (result.ok) {
      await recordSuccess(link.id, result.price, result.currency, "auto");
      results.push({ linkId: link.id, store: link.store, ok: true, price: result.price });
    } else {
      await recordFailure(link.id, result.reason, result.message ?? null);
      results.push({ linkId: link.id, store: link.store, ok: false, reason: result.reason });
    }
  }

  return NextResponse.json({ results });
}
