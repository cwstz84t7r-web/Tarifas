export type ScrapeResult =
  | {
      ok: true;
      price: number;
      currency: string;
      regularPrice?: number;
      isPromo?: boolean;
    }
  | {
      ok: false;
      reason: "blocked" | "not_found" | "network" | "parse";
      message?: string;
    };

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Tope por tienda para que una que no responda no se coma todo el tiempo
// disponible cuando se actualizan varias tiendas seguidas.
export const FETCH_TIMEOUT_MS = 8_000;
