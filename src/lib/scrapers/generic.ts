import * as cheerio from "cheerio";
import { BROWSER_USER_AGENT, type ScrapeResult } from "./types";

function parsePriceText(raw: string): number | null {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return null;
  let normalized = cleaned;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPriceFromJsonLd(json: any): number | null {
  const items = Array.isArray(json) ? json : [json];
  for (const item of items) {
    if (!item) continue;
    const nodes = Array.isArray(item["@graph"]) ? item["@graph"] : [item];
    for (const node of nodes) {
      if (!node) continue;
      const type = node["@type"];
      const isProduct =
        type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;

      const offers = node.offers;
      const offerList = Array.isArray(offers) ? offers : offers ? [offers] : [];
      for (const offer of offerList) {
        const rawPrice = offer?.price ?? offer?.priceSpecification?.price;
        if (rawPrice != null) {
          const price = parsePriceText(String(rawPrice));
          if (price != null) return price;
        }
      }
    }
  }
  return null;
}

export async function scrapeGeneric(url: string): Promise<ScrapeResult> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (res.status === 403 || res.status === 429) {
      return { ok: false, reason: "blocked" };
    }
    if (!res.ok) {
      return { ok: false, reason: "network", message: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    for (const el of $('script[type="application/ld+json"]').toArray()) {
      const raw = $(el).contents().text();
      if (!raw) continue;
      try {
        const json = JSON.parse(raw);
        const price = extractPriceFromJsonLd(json);
        if (price != null) return { ok: true, price, currency: "EUR" };
      } catch {
        // bloque JSON-LD malformado, seguimos probando otros
      }
    }

    const metaSelectors = [
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[itemprop="price"]',
    ];
    for (const selector of metaSelectors) {
      const content = $(selector).attr("content");
      if (content) {
        const price = parsePriceText(content);
        if (price != null) return { ok: true, price, currency: "EUR" };
      }
    }

    const itemPropEl = $("[itemprop='price']").first();
    if (itemPropEl.length) {
      const raw = itemPropEl.attr("content") ?? itemPropEl.text();
      const price = parsePriceText(raw);
      if (price != null) return { ok: true, price, currency: "EUR" };
    }

    return { ok: false, reason: "not_found" };
  } catch (err) {
    return { ok: false, reason: "network", message: String(err) };
  }
}
