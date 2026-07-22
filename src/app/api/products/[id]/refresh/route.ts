import { NextRequest, NextResponse } from "next/server";
import { getProductWithLinks, recordFailure, recordSuccess } from "@/lib/data";
import { scrapePrice } from "@/lib/scrapers";

// Límite máximo que permite el plan gratuito de Vercel para una función.
export const maxDuration = 60;

const PAUSE_BETWEEN_STORES_MS = 10_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  for (let i = 0; i < product.links.length; i++) {
    const link = product.links[i];
    if (i > 0) {
      // Pausa entre tienda y tienda para no parecer un bot disparando
      // peticiones en ráfaga.
      await sleep(PAUSE_BETWEEN_STORES_MS);
    }
    const result = await scrapePrice(link.store, link.url);
    if (result.ok) {
      await recordSuccess(
        link.id,
        result.price,
        result.currency,
        "auto",
        result.regularPrice ?? null,
        result.isPromo ?? false
      );
      results.push({ linkId: link.id, store: link.store, ok: true, price: result.price });
    } else {
      await recordFailure(link.id, result.reason, result.message ?? null);
      results.push({ linkId: link.id, store: link.store, ok: false, reason: result.reason });
    }
  }

  return NextResponse.json({ results });
}
