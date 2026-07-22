import type { StoreKey } from "@/lib/stores";
import { scrapeMercadona } from "./mercadona";
import { scrapeGeneric } from "./generic";
import type { ScrapeResult } from "./types";

export async function scrapePrice(store: StoreKey, url: string): Promise<ScrapeResult> {
  if (store === "mercadona") return scrapeMercadona(url);
  return scrapeGeneric(url);
}

export type { ScrapeResult } from "./types";
