import type { StoreKey } from "@/lib/stores";

export type LinkStatus = "ok" | "blocked" | "not_found" | "network" | "parse" | null;

export interface ProductLink {
  id: string;
  productId: string;
  store: StoreKey;
  url: string;
  lastPrice: string | null;
  lastCurrency: string | null;
  lastCheckedAt: string | null;
  lastStatus: LinkStatus;
  lastError: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  createdAt: string;
}

export interface ProductWithLinks extends Product {
  links: ProductLink[];
}

export interface PriceEntry {
  id: string;
  productLinkId: string;
  price: string;
  currency: string;
  source: "auto" | "manual";
  checkedAt: string;
}
