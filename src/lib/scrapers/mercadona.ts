import { BROWSER_USER_AGENT, type ScrapeResult } from "./types";

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
    });

    if (res.status === 403 || res.status === 429) {
      return { ok: false, reason: "blocked" };
    }
    if (!res.ok) {
      return { ok: false, reason: "network", message: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const raw =
      data?.price_instructions?.unit_price ??
      data?.price_instructions?.bulk_price ??
      data?.price_instructions?.reference_price;

    const price = parseFloat(String(raw).replace(",", "."));
    if (!Number.isFinite(price)) {
      return { ok: false, reason: "not_found" };
    }

    return { ok: true, price, currency: "EUR" };
  } catch (err) {
    return { ok: false, reason: "network", message: String(err) };
  }
}
