import type { StoreKey } from "@/lib/stores";

export type LinkStatus = "ok" | "blocked" | "not_found" | "network" | "parse" | null;

export interface ProductLink {
  id: string;
  productId: string;
  store: StoreKey;
  url: string;
  lastPrice: string | null;
  lastCurrency: string | null;
  lastRegularPrice: string | null;
  lastPromo: boolean;
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
  regularPrice: string | null;
  isPromo: boolean;
  source: "auto" | "manual";
  checkedAt: string;
}

export interface ShoppingItem {
  id: string;
  store: StoreKey;
  name: string;
  checked: boolean;
  productLinkId: string | null;
  createdAt: string;
}
