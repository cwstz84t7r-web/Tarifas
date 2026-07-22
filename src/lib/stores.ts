export const STORE_KEYS = [
  "mercadona",
  "dia",
  "carrefour",
  "alcampo",
  "consum",
  "eroski",
] as const;

export type StoreKey = (typeof STORE_KEYS)[number];

export const STORES: Record<
  StoreKey,
  { label: string; domain: string; color: string; example: string }
> = {
  mercadona: {
    label: "Mercadona",
    domain: "tienda.mercadona.es",
    color: "#00A19A",
    example: "https://tienda.mercadona.es/product/12345/...",
  },
  dia: {
    label: "Dia",
    domain: "dia.es",
    color: "#E30613",
    example: "https://www.dia.es/.../p",
  },
  carrefour: {
    label: "Carrefour",
    domain: "carrefour.es",
    color: "#004E9F",
    example: "https://www.carrefour.es/.../R-.../p",
  },
  alcampo: {
    label: "Alcampo",
    domain: "alcampo.es",
    color: "#E2001A",
    example: "https://www.alcampo.es/compra-online/.../p",
  },
  consum: {
    label: "Consum",
    domain: "consum.es",
    color: "#8DC63F",
    example: "https://tienda.consum.es/es/p/...",
  },
  eroski: {
    label: "Eroski",
    domain: "eroski.es",
    color: "#C10F2E",
    example: "https://supermercado.eroski.es/es/.../p",
  },
};

export function isStoreKey(value: string): value is StoreKey {
  return (STORE_KEYS as readonly string[]).includes(value);
}
