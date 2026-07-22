import { BROWSER_USER_AGENT, FETCH_TIMEOUT_MS, type ScrapeResult } from "./types";

function extractProductId(url: string): string | null {
  const match = url.match(/\/product\/(\d+)/);
  return match ? match[1] : null;
}

export async function scrapeMercadona(url: string): Promise<ScrapeResult> {
  const id = extractProductId(url);
  if (!id) {
    return {
      ok: false,
      reason: "parse",
      message:
        "No se reconoce el enlace. Debe ser del tipo tienda.mercadona.es/product/12345/...",
    };
  }

  try {
    const res = await fetch(`https://tienda.mercadona.es/api/products/${id}/`, {
      headers: {
        Accept: "application/json",
        "User-Agent": BROWSER_USER_AGENT,
        "Accept-Language": "es-ES,es;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.status === 403 || res.status === 429) {
      return { ok: false, reason: "blocked" };
    }
    if (!res.ok) {
      return { ok: false, reason: "network", message: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const instructions = data?.price_instructions ?? {};
    const raw = instructions.unit_price ?? instructions.bulk_price ?? instructions.reference_price;

    const price = parseFloat(String(raw).replace(",", "."));
    if (!Number.isFinite(price)) {
      return { ok: false, reason: "not_found" };
    }

    const isPromo = instructions.price_decreased === true;
    const rawPrevious = instructions.previous_unit_price ?? instructions.previous_bulk_price;
    const regularPrice = rawPrevious != null ? parseFloat(String(rawPrevious).replace(",", ".")) : undefined;

    return {
      ok: true,
      price,
      currency: "EUR",
      isPromo,
      regularPrice: isPromo && Number.isFinite(regularPrice) ? regularPrice : undefined,
    };
  } catch (err) {
    return { ok: false, reason: "network", message: String(err) };
  }
}
