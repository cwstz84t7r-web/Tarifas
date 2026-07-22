export type ScrapeResult =
  | { ok: true; price: number; currency: string }
  | {
      ok: false;
      reason: "blocked" | "not_found" | "network" | "parse";
      message?: string;
    };

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
